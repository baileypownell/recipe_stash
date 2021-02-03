
const { Router } = require('express')
const client = require('../db')
const router = Router()
const aws = require('aws-sdk')
const presignedUrlObject = require('./services/file-upload')

const uuid = require('uuid')
// const { S3RequestPresigner } = require("@aws-sdk/s3-request-presigner");
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
 
    const params = {
        Bucket: 'virtualcookbook-media', 
        Key: uuid.v4(),
        Expires: 10000, 
        ContentType: 'image/jpeg'
    } 

    console.log(params)

    s3.getSignedUrl('putObject', params, function(err, getSignedUrl) {
        if (err) {
            console.log(err)
            return res.status(422).send('Url not generated')
        }

        return res.json({
            postURL: getSignedUrl, 
            getURL: getSignedUrl.split('?')[0]
        })
    })
})

module.exports = router;