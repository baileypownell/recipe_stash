
import { Router } from 'express'
import client from './client'
const router = Router()
import { authMiddleware } from './authMiddleware'
import { getPresignedUrls, uploadSingleAWSFile, deleteSingleAWSFile } from './aws-s3'

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
  }

router.use(authMiddleware)

router.post('/:recipeId', authMiddleware, async(req: any, res) => {
    const { recipeId } = req.params
    let userId = req.userID
    try {
        let awsUploadRes: any = await uploadSingleAWSFile(req, res)
        client.query('INSERT INTO files(aws_download_url, recipe_uuid, user_uuid, key) VALUES($1, $2, $3, $4)', 
        [awsUploadRes.downloadUrl, recipeId, userId, awsUploadRes.key],
        (error, response) => {
            if (error) return res.status(500).json({ success: false, message: `There was an error: ${error}`})
            if (response.rowCount) {
                client.query('UPDATE recipes SET has_images = TRUE WHERE recipe_uuid = $1', 
                [recipeId], 
                (error, response) => {
                    if (error) return res.status(500).json({ 
                        success: false, 
                        message: `There was an error: ${error}`
                    }) 
                    if (response.rowCount) {
                        return res.status(200).json({ 
                            success: true, 
                            url: awsUploadRes.downloadUrl,
                            key: awsUploadRes.key 
                        })
                    }
                })
            }
        })
    } catch(error) {
        return res.status(500).json({ success: false, message: `There was an error: ${error}`})
    }
})

router.post('/', authMiddleware, async(req, res) => {
    const image_uuids = req.body.image_urls
    let urls = getPresignedUrls(image_uuids)
    res.status(200).json({ presignedUrls: urls})
})

router.post('/tile-image/:awsKey/:id', authMiddleware, async(req, res) => {

    const { awsKey, id } = req.params

    try {
        client.query('UPDATE recipes SET default_tile_image_key=$1 WHERE recipe_uuid=$2',
        [awsKey, id],
        (error, response) => {
            if (error) return res.status(500).json({ 
                success: false, 
                message: `There was an error: ${error}`
            }) 
            if (response.rowCount) {
                return res.status(200).json({ 
                    success: true, 
                })
            } else {
                return res.status(500).json({ 
                    success: false, 
                    message: `There was an error: ${error}`
                }) 
            }
        })
    } catch(e) {
        return res.status(500).json({ 
            success: false, 
            message: `There was an error: ${e}`
        }) 
    }
})

router.delete('/tile-image/:recipeId', authMiddleware, async(req, res) => {
    const { recipeId } = req.params
    try {
        client.query('UPDATE recipes SET default_tile_image_key=$1 WHERE recipe_uuid=$2',
        [null, recipeId],
        (error, response) => {
            if (error) return res.status(500).json({ 
                success: false, 
                message: `There was an error: ${error}`
            }) 
            if (response.rowCount) {
                return res.status(200).json({ 
                    success: true, 
                })
            } else {
                return res.status(500).json({ 
                    success: false, 
                    message: `There was an error: ${error}`
                }) 
            }
        })
    } catch(e) {
        return res.status(500).json({ 
            success: false, 
            message: `There was an error: ${e}`
        }) 
    }
})

router.delete('/:imageKey', authMiddleware, async(req, res) => {
    const { imageKey } = req.params
    try {
        await deleteSingleAWSFile(imageKey)
        client.query('DELETE FROM files WHERE key=$1 RETURNING recipe_uuid', 
        [imageKey],
        (error, response) => {
            if (error) return res.status(500).json({ success: false, message: `There was an error: ${error}`})
            // set recipe's "has_images" property to false if necessary
            let recipeId = response.rows[0].recipe_uuid 
            client.query('SELECT * FROM files WHERE recipe_uuid=$1', 
            [recipeId],
            (error, response) => {
                if (error) return res.status(500).json({ success: false, message: `There was an error: ${error}`})
                if (response.rowCount) {
                    return res.status(200).json({ success: true, message: 'File deleted.' })
                } else {
                    // mark has_images to false 
                    client.query('UPDATE recipes SET has_images = FALSE WHERE recipe_uuid = $1', 
                    [recipeId], 
                    (error, response) => {
                        if (error) return res.status(500).json({ success: false, message: `There was an error: ${error}`}) 
                        if (response.rowCount) {
                            return res.status(200).json({ success: true, message: 'File deleted.' }) 
                        }
                    })
                }
            })
        })
    } catch(err) {
        return res.status(500).json({ success: false, message: 'File could not be deleted from AWS.'})
    }
})

export default router
