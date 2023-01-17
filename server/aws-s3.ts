import aws from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const validExtension = ['image/jpg', 'image/jpeg', 'image/png'];

aws.config.update({
  secretAccessKey: process.env.S3_ACCESS_SECRET,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  region: process.env.S3_REGION,
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
  req.s3Key = uuidv4();
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

const getPresignedUrls = (image_uuids) => {
  return image_uuids.map((uuid) => {
    return s3.getSignedUrl('getObject', {
      Bucket: process.env.S3_BUCKET,
      Key: uuid,
    });
  });
};

const getPresignedUrl = (uuid) => {
  return s3.getSignedUrl('getObject', {
    Bucket: process.env.S3_BUCKET,
    Key: uuid,
  });
};

const deleteAWSFiles = (awsKeys) => {
  return Promise.all(
    awsKeys.map((key) => {
      return new Promise((resolve, reject) => {
        s3.deleteObject(
          {
            Bucket: process.env.S3_BUCKET as string,
            Key: key,
          },
          (err, data) => {
            if (err) reject(err);
            if (data) resolve(data);
          },
        );
      });
    }),
  );
};

const deleteSingleAWSFile = (imageKey) => {
  return new Promise((resolve, reject) => {
    s3.deleteObject(
      {
        Bucket: process.env.S3_BUCKET as string,
        Key: imageKey,
      },
      (err, data) => {
        if (err) {
          reject(err);
        } else if (data) {
          resolve(data);
        }
      },
    );
  });
};

export {
  getPresignedUrls,
  getPresignedUrl,
  uploadSingleAWSFile,
  deleteAWSFiles,
  deleteSingleAWSFile,
};
