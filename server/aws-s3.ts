import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const validExtension = ['image/jpg', 'image/jpeg', 'image/png'];

// v3 clients are constructed directly with config, rather than via a
// global aws.config.update() call.
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
    bucket: process.env.S3_BUCKET as string,
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
  return new Promise((resolve, reject) => {
    return singleFileUpload(req, res, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve({ downloadUrl, key: req.s3Key });
    });
  });
};

// v3 has no built-in getSignedUrl() method on the client itself — it's a
// separate helper that takes the client plus a command object describing
// the request to sign.
const getPresignedUrls = (image_uuids: string[]) => {
  return Promise.all(
    image_uuids.map((uuid) => {
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: uuid,
      });
      return getSignedUrl(s3, command);
    }),
  );
};

const getPresignedUrl = (uuid: string) => {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: uuid,
  });
  return getSignedUrl(s3, command);
};

// v3 commands are dispatched via client.send(command) and are
// promise-based natively, so no manual Promise wrapper or callback is
// needed here.
const deleteAWSFiles = (awsKeys: string[]) => {
  return Promise.all(
    awsKeys.map((key) => {
      const command = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET as string,
        Key: key,
      });
      return s3.send(command);
    }),
  );
};

const deleteSingleAWSFile = (imageKey: string) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET as string,
    Key: imageKey,
  });
  return s3.send(command);
};

export {
  getPresignedUrls,
  getPresignedUrl,
  uploadSingleAWSFile,
  deleteAWSFiles,
  deleteSingleAWSFile,
};
