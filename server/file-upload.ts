import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import type { PoolClient } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import {
  maximumImageSizeBytes,
  maximumImagesPerRecipe,
  supportedImageContentTypes,
} from '../shared/uploadConstraints.js';
import { authMiddleware } from './authMiddleware.js';
import { fileUploadRateLimit } from './authRateLimit.js';
import {
  createPresignedUploadUrl,
  createTileThumbnail,
  deleteAWSFiles,
  deleteSingleAWSFile,
  getPresignedUrls,
  inspectUploadedImage,
} from './aws-s3.js';
import client from './client.js';

const router = Router();
const uploadIntentLifetimeMs = 10 * 60 * 1000;
const supportedContentTypes = new Set<string>(supportedImageContentTypes);

const isUuid = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

const logServerError = (context: string, error: unknown) => {
  console.error(context, error);
};

const rollback = async (transactionClient: PoolClient | undefined) => {
  if (!transactionClient) return;
  try {
    await transactionClient.query('ROLLBACK');
  } catch (error) {
    logServerError('file-upload transaction rollback', error);
  }
};

const deleteObjectsBestEffort = async (keys: string[], context: string) => {
  if (!keys.length) return;
  try {
    await deleteAWSFiles(keys);
  } catch (error) {
    logServerError(context, error);
  }
};

router.use(authMiddleware);

router.post('/', async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const imageKeys = request.body.image_urls;
  const userId = request.session.userID;
  if (
    !Array.isArray(imageKeys) ||
    !imageKeys.length ||
    !imageKeys.every(isUuid) ||
    new Set(imageKeys).size !== imageKeys.length
  ) {
    return response.status(400).json({
      success: false,
      message: 'Invalid image keys.',
    });
  }

  try {
    const fileLookup = await client.query<{ key: string }>(
      'SELECT key FROM files WHERE key = ANY($1::uuid[]) AND user_uuid=$2',
      [imageKeys, userId],
    );
    if (fileLookup.rowCount !== imageKeys.length) {
      return response.status(404).json({
        success: false,
        message: 'One or more files were not found.',
      });
    }

    const ownedKeys = new Set(fileLookup.rows.map((file) => file.key));
    const urls = await getPresignedUrls(
      imageKeys.filter((key) => ownedKeys.has(key)),
    );
    return response.status(200).json({ presignedUrls: urls });
  } catch (error) {
    return next(error);
  }
});

router.post('/tile-image/:awsKey/:recipeId', async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { awsKey, recipeId } = request.params;
  const userId = request.session.userID;
  if (!isUuid(awsKey) || !isUuid(recipeId)) {
    return response.status(400).json({
      success: false,
      message: 'Invalid request sent.',
    });
  }

  let generatedThumbnailKey: string | null = null;
  let previousThumbnailKey: string | null = null;
  let transactionClient: PoolClient | undefined;
  try {
    const fileResult = await client.query<{ thumbnail_key: string | null }>(
      `SELECT thumbnail_key FROM files
      WHERE key=$1 AND recipe_uuid=$2 AND user_uuid=$3`,
      [awsKey, recipeId, userId],
    );
    if (!fileResult.rowCount) {
      return response.status(404).json({
        success: false,
        message: 'Recipe or file not found.',
      });
    }

    const thumbnailKey =
      fileResult.rows[0].thumbnail_key ??
      (generatedThumbnailKey = await createTileThumbnail(awsKey));

    transactionClient = await client.connect();
    await transactionClient.query('BEGIN');
    const recipeResult = await transactionClient.query<{
      default_tile_image_key: string | null;
      thumbnail_key: string | null;
    }>(
      `SELECT recipes.default_tile_image_key, files.thumbnail_key
      FROM recipes
      LEFT JOIN files
        ON files.recipe_uuid=recipes.recipe_uuid
        AND files.key=recipes.default_tile_image_key
      WHERE recipes.recipe_uuid=$1 AND recipes.user_uuid=$2
      FOR UPDATE OF recipes`,
      [recipeId, userId],
    );
    if (!recipeResult.rowCount) {
      throw new Error('Recipe no longer exists.');
    }

    const previousKey = recipeResult.rows[0].default_tile_image_key;
    if (previousKey && previousKey !== awsKey) {
      previousThumbnailKey = recipeResult.rows[0].thumbnail_key;
      await transactionClient.query(
        'UPDATE files SET thumbnail_key=NULL WHERE key=$1',
        [previousKey],
      );
    }
    await transactionClient.query(
      'UPDATE files SET thumbnail_key=$1 WHERE key=$2',
      [thumbnailKey, awsKey],
    );
    await transactionClient.query(
      `UPDATE recipes SET default_tile_image_key=$1
      WHERE recipe_uuid=$2 AND user_uuid=$3`,
      [awsKey, recipeId, userId],
    );
    await transactionClient.query('COMMIT');

    await deleteObjectsBestEffort(
      previousThumbnailKey ? [previousThumbnailKey] : [],
      'file-upload POST /tile-image previous thumbnail cleanup',
    );
    return response.status(200).json({ success: true });
  } catch (error) {
    await rollback(transactionClient);
    await deleteObjectsBestEffort(
      generatedThumbnailKey ? [generatedThumbnailKey] : [],
      'file-upload POST /tile-image generated thumbnail cleanup',
    );
    return next(error);
  } finally {
    transactionClient?.release();
  }
});

router.delete('/tile-image/:recipeId', async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { recipeId } = request.params;
  const userId = request.session.userID;
  if (!isUuid(recipeId)) {
    return response.status(400).json({
      success: false,
      message: 'Invalid request sent.',
    });
  }

  let thumbnailKey: string | null = null;
  let transactionClient: PoolClient | undefined;
  try {
    transactionClient = await client.connect();
    await transactionClient.query('BEGIN');
    const result = await transactionClient.query<{
      default_tile_image_key: string | null;
      thumbnail_key: string | null;
    }>(
      `SELECT recipes.default_tile_image_key, files.thumbnail_key
      FROM recipes
      LEFT JOIN files
        ON files.recipe_uuid=recipes.recipe_uuid
        AND files.key=recipes.default_tile_image_key
      WHERE recipes.recipe_uuid=$1 AND recipes.user_uuid=$2
      FOR UPDATE OF recipes`,
      [recipeId, userId],
    );
    if (!result.rowCount) {
      await transactionClient.query('ROLLBACK');
      return response.status(404).json({
        success: false,
        message: 'Recipe not found.',
      });
    }
    thumbnailKey = result.rows[0].thumbnail_key;
    await transactionClient.query(
      'UPDATE recipes SET default_tile_image_key=NULL WHERE recipe_uuid=$1',
      [recipeId],
    );
    if (result.rows[0].default_tile_image_key) {
      await transactionClient.query(
        'UPDATE files SET thumbnail_key=NULL WHERE key=$1',
        [result.rows[0].default_tile_image_key],
      );
    }
    await transactionClient.query('COMMIT');
    await deleteObjectsBestEffort(
      thumbnailKey ? [thumbnailKey] : [],
      'file-upload DELETE /tile-image thumbnail cleanup',
    );
    return response.status(200).json({ success: true });
  } catch (error) {
    await rollback(transactionClient);
    return next(error);
  } finally {
    transactionClient?.release();
  }
});

router.post('/:recipeId/upload-intent', fileUploadRateLimit, async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { recipeId } = request.params;
  const { fileSize, contentType } = request.body;
  const userId = request.session.userID;
  if (
    !isUuid(recipeId) ||
    typeof fileSize !== 'number' ||
    !Number.isSafeInteger(fileSize) ||
    fileSize <= 0 ||
    fileSize > maximumImageSizeBytes ||
    typeof contentType !== 'string' ||
    !supportedContentTypes.has(contentType)
  ) {
    console.log('Invalid upload intent request:', {
      recipeId,
      fileSize,
      contentType,
      userId,
    });
    return response.status(400).json({
      success: false,
      message: 'Invalid image upload request.',
    });
  }

  const key = uuidv4();
  const expiresAt = new Date(Date.now() + uploadIntentLifetimeMs);
  let transactionClient: PoolClient | undefined;
  let expiredKeys: string[] = [];
  try {
    transactionClient = await client.connect();
    await transactionClient.query('BEGIN');
    const recipeResult = await transactionClient.query(
      `SELECT 1 FROM recipes
      WHERE recipe_uuid=$1 AND user_uuid=$2
      FOR UPDATE`,
      [recipeId, userId],
    );
    if (!recipeResult.rowCount) {
      await transactionClient.query('ROLLBACK');
      return response.status(404).json({
        success: false,
        message: 'Recipe not found.',
      });
    }

    const expiredResult = await transactionClient.query<{ key: string }>(
      `DELETE FROM pending_file_uploads
      WHERE user_uuid=$1 AND expires_at <= NOW()
      RETURNING key`,
      [userId],
    );
    expiredKeys = expiredResult.rows.map((upload) => upload.key);

    const countResult = await transactionClient.query<{ count: number }>(
      `SELECT (
        (SELECT COUNT(*) FROM files WHERE recipe_uuid=$1) +
        (SELECT COUNT(*) FROM pending_file_uploads
          WHERE recipe_uuid=$1 AND expires_at > NOW())
      )::int AS count`,
      [recipeId],
    );
    if (countResult.rows[0].count >= maximumImagesPerRecipe) {
      await transactionClient.query('ROLLBACK');
      return response.status(409).json({
        success: false,
        message: `A recipe can have at most ${maximumImagesPerRecipe} images.`,
      });
    }

    await transactionClient.query(
      `INSERT INTO pending_file_uploads(
        key, recipe_uuid, user_uuid, expected_size, declared_content_type,
        expires_at
      ) VALUES($1, $2, $3, $4, $5, $6)`,
      [key, recipeId, userId, fileSize, contentType, expiresAt],
    );
    await transactionClient.query('COMMIT');
  } catch (error) {
    await rollback(transactionClient);
    return next(error);
  } finally {
    transactionClient?.release();
  }

  await deleteObjectsBestEffort(
    expiredKeys,
    'file-upload POST /:recipeId/upload-intent expired cleanup',
  );

  try {
    const uploadUrl = await createPresignedUploadUrl(
      key,
      contentType,
      fileSize,
    );
    return response.status(201).json({
      success: true,
      key,
      uploadUrl,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    await client.query('DELETE FROM pending_file_uploads WHERE key=$1', [key]);
    return next(error);
  }
});

router.post('/:recipeId/finalize/:imageKey', async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { recipeId, imageKey } = request.params;
  const { isTile = false } = request.body;
  const userId = request.session.userID;
  if (
    !isUuid(recipeId) ||
    !isUuid(imageKey) ||
    typeof isTile !== 'boolean'
  ) {
    return response.status(400).json({
      success: false,
      message: 'Invalid upload finalization request.',
    });
  }

  const intentResult = await client.query<{
    expected_size: number;
    declared_content_type: string;
  }>(
    `SELECT expected_size, declared_content_type
    FROM pending_file_uploads
    WHERE key=$1
    AND recipe_uuid=$2
    AND user_uuid=$3
    AND expires_at > NOW()`,
    [imageKey, recipeId, userId],
  );
  if (!intentResult.rowCount) {
    return response.status(404).json({
      success: false,
      message: 'Upload intent not found or expired.',
    });
  }

  let inspection: Awaited<ReturnType<typeof inspectUploadedImage>>;
  try {
    inspection = await inspectUploadedImage(imageKey);
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      error.name === 'NotFound'
    ) {
      return response.status(400).json({
        success: false,
        message: 'Uploaded image was not found.',
      });
    }
    return next(error);
  }

  const intent = intentResult.rows[0];
  if (
    inspection.contentLength !== intent.expected_size ||
    inspection.contentLength > maximumImageSizeBytes ||
    inspection.contentType !== intent.declared_content_type ||
    !inspection.contentType ||
    !supportedContentTypes.has(inspection.contentType)
  ) {
    await Promise.allSettled([
      deleteSingleAWSFile(imageKey),
      client.query('DELETE FROM pending_file_uploads WHERE key=$1', [imageKey]),
    ]);
    return response.status(400).json({
      success: false,
      message: 'Uploaded file failed image validation.',
    });
  }

  let thumbnailKey: string | null = null;
  if (isTile) {
    try {
      thumbnailKey = await createTileThumbnail(imageKey);
    } catch (error) {
      await Promise.allSettled([
        deleteSingleAWSFile(imageKey),
        client.query('DELETE FROM pending_file_uploads WHERE key=$1', [
          imageKey,
        ]),
      ]);
      return next(error);
    }
  }

  let transactionClient: PoolClient | undefined;
  try {
    transactionClient = await client.connect();
    await transactionClient.query('BEGIN');
    const lockedIntent = await transactionClient.query(
      `SELECT 1 FROM pending_file_uploads
      WHERE key=$1
      AND recipe_uuid=$2
      AND user_uuid=$3
      AND expires_at > NOW()
      FOR UPDATE`,
      [imageKey, recipeId, userId],
    );
    if (!lockedIntent.rowCount) {
      await transactionClient.query('ROLLBACK');
      await Promise.allSettled([
        deleteSingleAWSFile(imageKey),
        ...(thumbnailKey ? [deleteSingleAWSFile(thumbnailKey)] : []),
        client.query('DELETE FROM pending_file_uploads WHERE key=$1', [imageKey]),
      ]);
      return response.status(409).json({
        success: false,
        message: 'Upload intent expired before finalization.',
      });
    }

    const recipeResult = await transactionClient.query(
      `SELECT 1 FROM recipes
      WHERE recipe_uuid=$1 AND user_uuid=$2
      FOR UPDATE`,
      [recipeId, userId],
    );
    if (!recipeResult.rowCount) {
      throw new Error('Recipe no longer exists.');
    }

    const countResult = await transactionClient.query<{ count: number }>(
      'SELECT COUNT(*)::int AS count FROM files WHERE recipe_uuid=$1',
      [recipeId],
    );
    if (countResult.rows[0].count >= maximumImagesPerRecipe) {
      await transactionClient.query('ROLLBACK');
      await Promise.allSettled([
        deleteSingleAWSFile(imageKey),
        client.query('DELETE FROM pending_file_uploads WHERE key=$1', [imageKey]),
      ]);
      return response.status(409).json({
        success: false,
        message: `A recipe can have at most ${maximumImagesPerRecipe} images.`,
      });
    }

    await transactionClient.query(
      `INSERT INTO files(
        recipe_uuid, user_uuid, key, content_type, size_bytes, thumbnail_key
      ) VALUES($1, $2, $3, $4, $5, $6)`,
      [
        recipeId,
        userId,
        imageKey,
        inspection.contentType,
        inspection.contentLength,
        thumbnailKey,
      ],
    );
    await transactionClient.query(
      'DELETE FROM pending_file_uploads WHERE key=$1',
      [imageKey],
    );
    await transactionClient.query('COMMIT');
    return response.status(201).json({
      success: true,
      key: imageKey,
    });
  } catch (error) {
    await rollback(transactionClient);
    const cleanupResults = await Promise.allSettled([
      deleteSingleAWSFile(imageKey),
      ...(thumbnailKey ? [deleteSingleAWSFile(thumbnailKey)] : []),
      client.query('DELETE FROM pending_file_uploads WHERE key=$1', [imageKey]),
    ]);
    for (const cleanupResult of cleanupResults) {
      if (cleanupResult.status === 'rejected') {
        logServerError(
          'file-upload POST /:recipeId/finalize/:imageKey cleanup',
          cleanupResult.reason,
        );
      }
    }
    return next(error);
  } finally {
    transactionClient?.release();
  }
});

router.delete('/:imageKey', async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { imageKey } = request.params;
  const userId = request.session.userID;
  if (!isUuid(imageKey)) {
    return response.status(400).json({
      success: false,
      message: 'Invalid image key.',
    });
  }

  const transactionClient = await client.connect();
  let deletedThumbnailKey: string | null = null;
  try {
    await transactionClient.query('BEGIN');
    const fileResult = await transactionClient.query<{
      recipe_uuid: string;
      thumbnail_key: string | null;
    }>(
      `SELECT recipe_uuid, thumbnail_key FROM files
      WHERE key=$1 AND user_uuid=$2
      FOR UPDATE`,
      [imageKey, userId],
    );
    if (!fileResult.rowCount) {
      await transactionClient.query('ROLLBACK');
      return response.status(404).json({
        success: false,
        message: 'File not found.',
      });
    }

    const recipeId = fileResult.rows[0].recipe_uuid;
    deletedThumbnailKey = fileResult.rows[0].thumbnail_key;
    await transactionClient.query(
      `UPDATE recipes
      SET default_tile_image_key=NULL
      WHERE recipe_uuid=$1 AND default_tile_image_key=$2`,
      [recipeId, imageKey],
    );
    await transactionClient.query(
      'DELETE FROM files WHERE key=$1 AND user_uuid=$2',
      [imageKey, userId],
    );
    await transactionClient.query('COMMIT');
  } catch (error) {
    await rollback(transactionClient);
    return next(error);
  } finally {
    transactionClient.release();
  }

  await deleteObjectsBestEffort(
    [imageKey, deletedThumbnailKey].filter(
      (key): key is string => Boolean(key),
    ),
    'file-upload DELETE /:imageKey S3 cleanup',
  );
  return response.status(200).json({
    success: true,
    message: 'File deleted.',
  });
});

export default router;
