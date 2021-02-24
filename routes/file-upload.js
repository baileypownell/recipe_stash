
const { Router } = require('express')
const client = require('../db')
const router = Router()
const authMiddleware = require('./authMiddleware.js')
const  { getPresignedUrls, s3, uploadToS3 } = require('./aws-s3')

router.use(authMiddleware)

router.post('/:recipeId', authMiddleware, (req, res) => {
    const { recipeId } = req.params
    let userId = req.userID
    uploadToS3(req, res)
    .then(awsUploadRes => {
        client.query('INSERT INTO files(aws_download_url, recipe_id, user_id, key) VALUES($1, $2, $3, $4)', 
        [awsUploadRes.downloadUrl, recipeId, userId, awsUploadRes.key],
        (error, response) => {
            if (error) return res.status(500).json({ success: false, message: `There was an error: ${error}`})
            if (response.rowCount) {
                client.query('UPDATE recipes SET has_images = TRUE WHERE id = $1', 
                    [recipeId], 
                    (error, response) => {
                        if (error) return res.status(500).json({ success: false, message: `There was an error: ${error}`}) 
                        if (response.rowCount) {
                            return res.status(200).json({ success: true, url: awsUploadRes.downloadUrl })
                        }
                    })
            }
        })
    })
    .catch(e => {
        console.log(e)
    })
})

router.post('/', authMiddleware, async(req, res) => {
    const image_uuids = req.body.image_urls
    let urls = getPresignedUrls(image_uuids)
    res.status(200).json({ presignedUrls: urls})
})

router.delete('/:imageKey', authMiddleware, (req, res) => {
    const { imageKey } = req.params
    s3.deleteObject({
        Bucket: 'virtualcookbook-media',
        Key: imageKey
    }, (err, data) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'File could not be deleted from AWS.'})
        } else {
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
        }
    })
})

module.exports = router;