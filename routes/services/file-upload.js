const aws = require('aws-sdk')
const  multer = require('multer')
const  multerS3 = require('multer-s3')
const uuid = require('uuid')
// const { S3RequestPresigner } = require("@aws-sdk/s3-request-presigner");
const environment = process.env.NODE_ENV || 'development';

if (environment === 'development') {
    require('dotenv').config({
      path: '../../.env'
    })
  }
 
aws.config.update({
    secretAccessKey: process.env.S3_ACCESS_SECRET, 
    accessKeyId: process.env.S3_ACCESS_KEY_ID, 
    region: 'us-east-2'
})

const s3 = new aws.S3()

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(new Error('Invalid Mime Type; only jpg/jpeg/png files are valid'), false)
    }
}


const getPresignedUrl = (req, res, next) => {
    const params = {
        Bucket: 'virtualcookbook-media', 
        Key: uuid.v4(),
        Expires: 10000, 
        ContentType: 'image/jpeg'
    } 

    s3.getSignedUrl('putObject', params, function(err, getSignedUrl) {
        if (err) {
            console.log(err)
            return next(err)
        }

        return res.json({
            postURL: getSignedUrl, 
            getURL: getSignedUrl.split('?')[0]
        })
    })


}

// const upload = multer({
//     fileFilter,
//     storage: multerS3({
//         s3,
//         bucket: 'virtualcookbook-media',
//         acl: 'public-read',
//         metadata: function (req, file, cb) {
//             cb(null, { fieldName: file.fieldname });
//         },
//         key: function (req, file, cb) {
//             cb(null, Date.now().toString() + '-' + file.originalname)
//         }
//   })
// })

module.exports = getPresignedUrl;