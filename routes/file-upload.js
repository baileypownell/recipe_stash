
const { Router } = require('express')
const client = require('../db')
const router = Router()
const aws = require('aws-sdk')
const uuid = require('uuid')
const environment = process.env.NODE_ENV || 'development';

if (environment === 'development') {
    require('dotenv').config({
      path: '../.env'
    })
  }

const s3 = new aws.S3({
    secretAccessKey: process.env.S3_ACCESS_SECRET, 
    accessKeyId: process.env.S3_ACCESS_KEY_ID, 
    signatureVersion: 'v4',
    region: 'us-east-2'
})

router.post('/', (req, res) => {

    if (!req.files) {
        return res.status(400).json({success: false, message: 'No file attached.'})
    }
 
    let file = req.files.file
    console.log(file)

    let params = {
        Bucket: 'virtualcookbook-media',
        Key: uuid.v4(),
        Body: file.data, 
        ContentType: file.mimetype, 
    }

    s3.upload(params, (err, data) => {
        if (err) {
            console.log(err)
        } else {
            return res.status(200).json({ success: true })
        }
    })
})

module.exports = router;