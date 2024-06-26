"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = __importDefault(require("./client"));
const authMiddleware_1 = require("./authMiddleware");
const aws_s3_1 = require("./aws-s3");
const router = (0, express_1.Router)();
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
router.use(authMiddleware_1.authMiddleware);
router.post('/:recipeId', authMiddleware_1.authMiddleware, async (req, res) => {
    const { recipeId } = req.params;
    const userId = req.userID;
    try {
        const awsUploadRes = await (0, aws_s3_1.uploadSingleAWSFile)(req, res);
        client_1.default.query('INSERT INTO files(aws_download_url, recipe_uuid, user_uuid, key) VALUES($1, $2, $3, $4)', [awsUploadRes.downloadUrl, recipeId, userId, awsUploadRes.key], (error, response) => {
            if (error) {
                throw error;
            }
            if (response.rowCount) {
                client_1.default.query('UPDATE recipes SET has_images = TRUE WHERE recipe_uuid = $1', [recipeId], (error, response) => {
                    if (error) {
                        return res.status(500).json({
                            success: false,
                            message: `There was an error: ${error}`,
                        });
                    }
                    if (response.rowCount) {
                        return res.status(200).json({
                            success: true,
                            url: awsUploadRes.downloadUrl,
                            key: awsUploadRes.key,
                        });
                    }
                });
            }
        });
    }
    catch (error) {
        throw error;
    }
});
router.post('/', authMiddleware_1.authMiddleware, async (req, res) => {
    const image_uuids = req.body.image_urls;
    const urls = (0, aws_s3_1.getPresignedUrls)(image_uuids);
    res.status(200).json({ presignedUrls: urls });
});
router.post('/tile-image/:awsKey/:id', authMiddleware_1.authMiddleware, async (req, res) => {
    const { awsKey, id } = req.params;
    try {
        return client_1.default.query('UPDATE recipes SET default_tile_image_key=$1 WHERE recipe_uuid=$2', [awsKey, id], (error, response) => {
            if (error) {
                return res.status(500).json({
                    success: false,
                    message: `There was an error: ${error}`,
                });
            }
            if (response.rowCount) {
                return res.status(200).json({
                    success: true,
                });
            }
            else {
                return res.status(500).json({
                    success: false,
                    message: `There was an error: ${error}`,
                });
            }
        });
    }
    catch (e) {
        return res.status(500).json({
            success: false,
            message: `There was an error: ${e}`,
        });
    }
});
router.delete('/tile-image/:recipeId', authMiddleware_1.authMiddleware, async (req, res) => {
    const { recipeId } = req.params;
    try {
        client_1.default.query('UPDATE recipes SET default_tile_image_key=$1 WHERE recipe_uuid=$2', [null, recipeId], (error, response) => {
            if (error) {
                return res.status(500).json({
                    success: false,
                    message: `There was an error: ${error}`,
                });
            }
            if (response.rowCount) {
                return res.status(200).json({
                    success: true,
                });
            }
            else {
                return res.status(500).json({
                    success: false,
                    message: `There was an error: ${error}`,
                });
            }
        });
    }
    catch (e) {
        return res.status(500).json({
            success: false,
            message: `There was an error: ${e}`,
        });
    }
});
router.delete('/:imageKey', authMiddleware_1.authMiddleware, async (req, res) => {
    const { imageKey } = req.params;
    try {
        await (0, aws_s3_1.deleteSingleAWSFile)(imageKey);
        client_1.default.query('DELETE FROM files WHERE key=$1 RETURNING recipe_uuid', [imageKey], (error, response) => {
            if (error)
                return res
                    .status(500)
                    .json({ success: false, message: `There was an error: ${error}` });
            // set recipe's "has_images" property to false if necessary
            const recipeId = response.rows[0].recipe_uuid;
            client_1.default.query('SELECT * FROM files WHERE recipe_uuid=$1', [recipeId], (error, response) => {
                if (error)
                    return res.status(500).json({
                        success: false,
                        message: `There was an error: ${error}`,
                    });
                if (response.rowCount) {
                    return res
                        .status(200)
                        .json({ success: true, message: 'File deleted.' });
                }
                else {
                    // mark has_images to false
                    client_1.default.query('UPDATE recipes SET has_images = FALSE WHERE recipe_uuid = $1', [recipeId], (error, response) => {
                        if (error)
                            return res.status(500).json({
                                success: false,
                                message: `There was an error: ${error}`,
                            });
                        if (response.rowCount) {
                            return res
                                .status(200)
                                .json({ success: true, message: 'File deleted.' });
                        }
                    });
                }
            });
        });
    }
    catch (err) {
        return res
            .status(500)
            .json({ success: false, message: 'File could not be deleted from AWS.' });
    }
});
exports.default = router;
//# sourceMappingURL=file-upload.js.map