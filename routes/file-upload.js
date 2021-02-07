
const { Router } = require('express')
const client = require('../db')
const router = Router()
const aws = require('aws-sdk')
const { v4: uuidv4 } = require('uuid');
const multer = require('multer')
const multerS3 = require('multer-s3')
const fs = require('fs')
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

router.post('/', (req, res) => {
    uploadToS3(req, res)
    .then(downloadUrl => {
        // update the db
        return res.status(200).send({ downloadUrl })
    })
    .catch(e => {
        console.log(e)
    })
})

module.exports = router;