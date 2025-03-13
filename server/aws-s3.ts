import {
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const validExtension = ['image/jpg', 'image/jpeg', 'image/png'];

const s3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.S3_ACCESS_SECRET as string,
  },
});

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
  return Promise.all(
    image_uuids.map(async (uuid) => {
      return await getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: uuid,
        }),
      );
    }),
  );
};

const getPresignedUrl = async (uuid) => {
  return await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: uuid,
    }),
  );
};

const deleteAWSFiles = (awsKeys) => {
  return Promise.all(
    awsKeys.map(async (key) => {
      return await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET as string,
          Key: key,
        }),
      );
    }),
  );
};

const deleteSingleAWSFile = async (imageKey) => {
  return await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET as string,
      Key: imageKey,
    }),
  );
};

export {
  getPresignedUrls,
  getPresignedUrl,
  uploadSingleAWSFile,
  deleteAWSFiles,
  deleteSingleAWSFile,
};
