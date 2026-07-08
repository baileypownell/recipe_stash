import { Router } from 'express';
import dotenv from 'dotenv';
import client from './client.js';
import { authMiddleware } from './authMiddleware.js';
import {
  getPresignedUrls,
  uploadSingleAWSFile,
  deleteSingleAWSFile,
} from './aws-s3.js';
const router = Router();

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

router.use(authMiddleware);

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

router.post('/', async (req: any, res) => {
  const imageKeys = req.body.image_urls;
  const userId = req.session.userID;

  if (
    !Array.isArray(imageKeys) ||
    !imageKeys.length ||
    !imageKeys.every((key) => typeof key === 'string' && isUuid(key))
  ) {
    return res.status(400).json({
      success: false,
      message: 'Invalid image keys.',
    });
  }

  try {
    const fileLookup = await client.query(
      'SELECT key FROM files WHERE key = ANY($1::uuid[]) AND user_uuid=$2',
      [imageKeys, userId],
    );

    if (fileLookup.rowCount !== imageKeys.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more files were not found.',
      });
    }

    const urls = await getPresignedUrls(fileLookup.rows.map((row) => row.key));
    return res.status(200).json({ presignedUrls: urls });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Could not generate presigned URLs.',
    });
  }
});

router.post('/tile-image/:awsKey/:id', async (req: any, res) => {
  const { awsKey, id } = req.params;
  const userId = req.session.userID;

  if (!isUuid(awsKey) || !isUuid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid request sent.',
    });
  }

  try {
    const response = await client.query(
      `UPDATE recipes
      SET default_tile_image_key=$1
      WHERE recipe_uuid=$2
      AND user_uuid=$3
      AND EXISTS (
        SELECT 1 FROM files
        WHERE key=$1::uuid
        AND recipe_uuid=$2
        AND user_uuid=$3
      )`,
      [awsKey, id, userId],
    );
    if (response.rowCount) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Recipe or file not found.',
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `There was an error: ${error}` });
  }
});

router.delete('/tile-image/:recipeId', async (req: any, res) => {
  const { recipeId } = req.params;
  const userId = req.session.userID;

  if (!isUuid(recipeId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid request sent.',
    });
  }

  try {
    const response = await client.query(
      'UPDATE recipes SET default_tile_image_key=$1 WHERE recipe_uuid=$2 AND user_uuid=$3',
      [null, recipeId, userId],
    );
    if (response.rowCount) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found or you do not have permission to edit it.',
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `There was an error: ${error}` });
  }
});

router.post('/:recipeId', async (req: any, res) => {
  const { recipeId } = req.params;
  const userId = req.session.userID;

  if (!isUuid(recipeId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid recipe id.',
    });
  }

  try {
    const ownerCheck = await client.query(
      'SELECT 1 FROM recipes WHERE recipe_uuid=$1 AND user_uuid=$2',
      [recipeId, userId],
    );
    if (!ownerCheck.rowCount) {
      return res
        .status(404)
        .json({ success: false, message: 'Recipe not found.' });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `There was an error: ${error}` });
  }

  let awsUploadRes: any;
  try {
    awsUploadRes = await uploadSingleAWSFile(req, res);
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: 'File could not be uploaded.' });
  }

  try {
    const insertResult = await client.query(
      'INSERT INTO files(aws_download_url, recipe_uuid, user_uuid, key) VALUES($1, $2, $3, $4)',
      [awsUploadRes.downloadUrl, recipeId, userId, awsUploadRes.key],
    );

    if (!insertResult.rowCount) {
      // Roll back the orphaned S3 object since the DB record was never
      // created for it.
      await deleteSingleAWSFile(awsUploadRes.key);
      return res.status(500).json({
        success: false,
        message: 'File record could not be saved.',
      });
    }

    const updateResult = await client.query(
      'UPDATE recipes SET has_images = TRUE WHERE recipe_uuid = $1',
      [recipeId],
    );

    if (!updateResult.rowCount) {
      return res.status(500).json({
        success: false,
        message: 'Recipe could not be updated.',
      });
    }

    return res.status(200).json({
      success: true,
      url: awsUploadRes.downloadUrl,
      key: awsUploadRes.key,
    });
  } catch (error) {
    try {
      await deleteSingleAWSFile(awsUploadRes.key);
    } catch (cleanupErr) {
      console.error('Failed to roll back orphaned S3 object:', cleanupErr);
    }
    return res
      .status(500)
      .json({ success: false, message: `There was an error: ${error}` });
  }
});

router.delete('/:imageKey', async (req: any, res) => {
  const { imageKey } = req.params;
  const userId = req.session.userID;

  if (!isUuid(imageKey)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid image key.',
    });
  }

  try {
    // Confirm ownership and fetch the recipe_uuid BEFORE touching S3, so a
    // missing/foreign file never results in deleting someone else's object
    // or crashing on an empty rows array.
    const fileLookup = await client.query(
      'SELECT recipe_uuid FROM files WHERE key=$1 AND user_uuid=$2',
      [imageKey, userId],
    );

    if (!fileLookup.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'File not found or you do not have permission to delete it.',
      });
    }

    const recipeId = fileLookup.rows[0].recipe_uuid;

    await deleteSingleAWSFile(imageKey);

    await client.query('DELETE FROM files WHERE key=$1', [imageKey]);

    const remaining = await client.query(
      'SELECT * FROM files WHERE recipe_uuid=$1',
      [recipeId],
    );

    if (!remaining.rowCount) {
      const updateResult = await client.query(
        'UPDATE recipes SET has_images = FALSE WHERE recipe_uuid = $1',
        [recipeId],
      );
      if (!updateResult.rowCount) {
        return res.status(500).json({
          success: false,
          message: 'File deleted, but recipe could not be updated.',
        });
      }
    }

    return res.status(200).json({ success: true, message: 'File deleted.' });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: 'File could not be deleted.' });
  }
});

export default router;
