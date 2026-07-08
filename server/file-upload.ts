import { Router } from 'express';
import client from './client';
import { authMiddleware } from './authMiddleware';
import {
  getPresignedUrls,
  uploadSingleAWSFile,
  deleteSingleAWSFile,
} from './aws-s3';
const router = Router();

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

router.use(authMiddleware);

// NOTE: authMiddleware is already applied via router.use() above, so it's
// dropped from individual route signatures below to avoid running it twice.

router.post('/:recipeId', async (req: any, res) => {
  const { recipeId } = req.params;
  const userId = req.session.userID;

  // Confirm the recipe exists AND belongs to this user before accepting an
  // upload for it. Adjust the column name if your recipes table uses a
  // different owner column.
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
    // The DB step failed after a successful S3 upload — clean up the
    // orphaned object so it doesn't linger with no matching record.
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

router.post('/', async (req, res) => {
  const image_uuids = req.body.image_urls;
  try {
    // getPresignedUrls is async in the v3 SDK version (Promise.all under
    // the hood) — this was previously called without await, which sent an
    // unresolved Promise back to the client instead of real URLs.
    const urls = await getPresignedUrls(image_uuids);
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
  try {
    const response = await client.query(
      'UPDATE recipes SET default_tile_image_key=$1 WHERE recipe_uuid=$2 AND user_uuid=$3',
      [awsKey, id, userId],
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

router.delete('/tile-image/:recipeId', async (req: any, res) => {
  const { recipeId } = req.params;
  const userId = req.session.userID;
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

router.delete('/:imageKey', async (req: any, res) => {
  const { imageKey } = req.params;
  const userId = req.session.userID;

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
