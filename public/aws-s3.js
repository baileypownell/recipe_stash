"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const multerS3 = require('multer-s3');
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const validExtension = ['image/jpg', 'image/jpeg', 'image/png'];
aws.config.update({
    secretAccessKey: process.env.S3_ACCESS_SECRET,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    region: process.env.S3_REGION
});
const s3 = new aws.S3();
const upload = multer({
    storage: multerS3({
        s3,
        bucket: process.env.S3_BUCKET,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (_, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, _, cb) {
            cb(null, req.s3Key);
        }
    }),
    fileFilter: function (_, file, cb) {
        if (!validExtension.includes(file.mimetype)) {
            return cb(null, false);
        }
        cb(null, true);
    }
});
const singleFileUpload = upload.single('image');
const uploadSingleAWSFile = (req, res) => {
    req.s3Key = uuidv4();
    const downloadUrl = `https://${process.env.AWS_REGION}.amazonaws.com/${process.env.S3_BUCKET}/${req.s3Key}`;
    return new Promise((resolve, reject) => {
        return singleFileUpload(req, res, err => {
            if (err)
                return reject(err);
            return resolve({ downloadUrl, key: req.s3Key });
        });
    });
};
exports.uploadSingleAWSFile = uploadSingleAWSFile;
const getPresignedUrls = (image_uuids) => {
    return (image_uuids.map(uuid => {
        return s3.getSignedUrl('getObject', {
            Bucket: process.env.S3_BUCKET,
            Key: uuid
        });
    }));
};
exports.getPresignedUrls = getPresignedUrls;
const getPresignedUrl = (uuid) => {
    return s3.getSignedUrl('getObject', {
        Bucket: process.env.S3_BUCKET,
        Key: uuid
    });
};
exports.getPresignedUrl = getPresignedUrl;
const deleteAWSFiles = (awsKeys) => {
    return Promise.all(awsKeys.map(key => {
        return new Promise((resolve, reject) => {
            s3.deleteObject({
                Bucket: process.env.S3_BUCKET,
                Key: key
            }, (err, data) => {
                if (err)
                    reject(err);
                if (data)
                    resolve(data);
            });
        });
    }));
};
exports.deleteAWSFiles = deleteAWSFiles;
const deleteSingleAWSFile = (imageKey) => {
    return new Promise((resolve, reject) => {
        s3.deleteObject({
            Bucket: process.env.S3_BUCKET,
            Key: imageKey
        }, (err, data) => {
            if (err) {
                reject(err);
            }
            else if (data) {
                resolve(data);
            }
        });
    });
};
exports.deleteSingleAWSFile = deleteSingleAWSFile;
//# sourceMappingURL=aws-s3.js.map