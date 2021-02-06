
const { Router } = require('express')
const client = require('../db')
const router = Router()
const aws = require('aws-sdk')
const uuid = require('uuid')
const multer = require('multer');
const fs = require('fs')
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

const storage = multer.diskStorage({
    destination: './uploads', 
    fileName: function(req, file, callback) {
        console.log(file)
      callback(null, `${file.originalname}`)
    }
  })
  
  const upload = multer({
    storage: storage, 
  }).single('image')


router.post('/', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.json({error: true})
            return
        }
        console.log(req.file)
        let params = {
            Bucket: 'virtualcookbook-media',
            Key: uuid.v4(),
            Body: `uploads/${req.file.filename}`, 
            ContentType: req.file.mimetype, 
        }
    
        s3.upload(params, (err, data) => {
            if (err) {
                console.log(err)
            } else {
                return res.status(200).json({ success: true })
            }
        })
    })
})

module.exports = router;