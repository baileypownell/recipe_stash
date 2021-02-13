
const { Router, response } = require('express')
const client = require('../db')
const router = Router()
const aws = require('aws-sdk')
const { v4: uuidv4 } = require('uuid');
const multer = require('multer')
const multerS3 = require('multer-s3')
const authMiddleware = require('./authMiddleware.js')
const environment = process.env.NODE_ENV || 'development';

if (environment === 'development') {
    require('dotenv').config({
      path: '../.env'
    })
  }


aws.config.update({
    secretAccessKey: process.env.S3_ACCESS_SECRET, 
    accessKeyId: process.env.S3_ACCESS_KEY_ID, 
    region: 'us-east-2'
})

const s3 = new aws.S3()

const upload = multer({
    storage: multerS3({
        s3, 
        bucket: 'virtualcookbook-media',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname})
        }, 
        key: function (req, file, cb) {
            cb(null, req.s3Key)
        }
    })
})
const singleFileUpload = upload.single('image')

function uploadToS3(req, res) {
    req.s3Key = uuidv4()
    let downloadUrl = `https://s3-us-east-2.amazonaws.com/virtualcookbook-media/${req.s3Key}`
    return new Promise((resolve, reject) => {
        return singleFileUpload(req, res, err => {
            if (err) return reject(err)
            return resolve(downloadUrl)
        }) 
    })
}

router.use(authMiddleware)

router.post('/:recipeId', authMiddleware, (req, res) => {
    const { recipeId } = req.params
    let userId = req.userID
    uploadToS3(req, res)
    .then(downloadUrl => {
        client.query('INSERT INTO files(aws_download_url, recipe_id, user_id) VALUES($1, $2, $3)', 
        [downloadUrl, recipeId, userId],
        (error, response) => {
            if (error) return res.status(500).json({ success: false, message: `There was an error: ${error}`})
            if (response.rowCount) {
                return res.status(200).json({ success: true, downloadUrl })
            }
        })
    })
    .catch(e => {
        console.log(e)
    })
})

router.delete('/:recipeId/:recipeKey', authMiddleware, (req, res) => {
    const { recipeId } = req.params
    const { recipeKey } = req.params
    let userId = request.userID

    // get the name of the file extension based on the id

    s3.deleteObject({
        Bucket: 'virtualcookbook-media',
        Key: recipeKey
    }, (err, data) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'File could not be deleted from AWS.'})
        } else {
            client.query('DELETE FROM files WHERE recipeId=$1 AND userId=$2', 
                [recipeId, userId],
                (error, response) => {
                    if (error) return res.status(500).json({ success: false, message: `There was an error: ${error}`})
                    if (response.rowCount) {
                        return res.status(200).json({ success: true, message: 'File deleted.' })
                    }
                })
        }
    })
})

module.exports = router;