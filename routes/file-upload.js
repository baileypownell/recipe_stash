
const { Router } = require('express')
const client = require('../db')
const router = Router()
const authMiddleware = require('./authMiddleware.js')
const  { getPresignedUrls, uploadSingleAWSFile, deleteSingleAWSFile } = require('./aws-s3')

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
  }

router.use(authMiddleware)

router.post('/:recipeId', authMiddleware, async(req, res) => {
    const { recipeId } = req.params
    let userId = req.userID
    try {
        let awsUploadRes = await uploadSingleAWSFile(req, res)
        client.query('INSERT INTO files(aws_download_url, recipe_id, user_id, key) VALUES($1, $2, $3, $4)', 
        [awsUploadRes.downloadUrl, recipeId, userId, awsUploadRes.key],
        (error, response) => {
            if (error) return res.status(500).json({ success: false, message: `There was an error: ${error}`})
            if (response.rowCount) {
                client.query('UPDATE recipes SET has_images = TRUE WHERE id = $1', 
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

router.post('/set-tile-image/:awsKey/:id', authMiddleware, async(req, res) => {

    const { awsKey, id } = req.params

    try {
        client.query('UPDATE recipes SET default_tile_image_key=$1 WHERE id=$2',
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

router.delete('/:imageKey', authMiddleware, async(req, res) => {
    const { imageKey } = req.params
    try {
        await deleteSingleAWSFile(imageKey)
        client.query('DELETE FROM files WHERE key=$1 RETURNING recipe_id', 
        [imageKey],
        (error, response) => {
            if (error) return res.status(500).json({ success: false, message: `There was an error: ${error}`})
            // set recipe's "has_images" property to false if necessary
            let recipeId = response.rows[0].recipe_id 
            client.query('SELECT * FROM files WHERE recipe_id=$1', 
            [recipeId],
            (error, response) => {
                if (error) return res.status(500).json({ success: false, message: `There was an error: ${error}`})
                if (response.rowCount) {
                    return res.status(200).json({ success: true, message: 'File deleted.' })
                } else {
                    // mark has_images to false 
                    client.query('UPDATE recipes SET has_images = FALSE WHERE id = $1', 
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

module.exports = router;