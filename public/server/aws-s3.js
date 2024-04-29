"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSingleAWSFile = exports.deleteAWSFiles = exports.uploadSingleAWSFile = exports.getPresignedUrl = exports.getPresignedUrls = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const uuid_1 = require("uuid");
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const validExtension = ['image/jpg', 'image/jpeg', 'image/png'];
aws_sdk_1.default.config.update({
    secretAccessKey: process.env.S3_ACCESS_SECRET,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    region: process.env.S3_REGION,
});
const s3 = new aws_sdk_1.default.S3();
const upload = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3,
        bucket: process.env.S3_BUCKET,
        contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
        metadata: function (_, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, _, cb) {
            cb(null, req.s3Key);
        },
    }),
    fileFilter: function (_, file, cb) {
        if (!validExtension.includes(file.mimetype)) {
            return cb(null, false);
        }
        cb(null, true);
    },
});
const singleFileUpload = upload.single('image');
const uploadSingleAWSFile = (req, res) => {
    req.s3Key = (0, uuid_1.v4)();
    const downloadUrl = `https://${process.env.AWS_REGION}.amazonaws.com/${process.env.S3_BUCKET}/${req.s3Key}`;
    return new Promise((resolve) => {
        return singleFileUpload(req, res, (err) => {
            if (err) {
                throw err;
            }
            return resolve({ downloadUrl, key: req.s3Key });
        });
    });
};
exports.uploadSingleAWSFile = uploadSingleAWSFile;
const getPresignedUrls = (image_uuids) => {
    return image_uuids.map((uuid) => {
        return s3.getSignedUrl('getObject', {
            Bucket: process.env.S3_BUCKET,
            Key: uuid,
        });
    });
};
exports.getPresignedUrls = getPresignedUrls;
const getPresignedUrl = (uuid) => {
    return s3.getSignedUrl('getObject', {
        Bucket: process.env.S3_BUCKET,
        Key: uuid,
    });
};
exports.getPresignedUrl = getPresignedUrl;
const deleteAWSFiles = (awsKeys) => {
    return Promise.all(awsKeys.map((key) => {
        return new Promise((resolve, reject) => {
            s3.deleteObject({
                Bucket: process.env.S3_BUCKET,
                Key: key,
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
            Key: imageKey,
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