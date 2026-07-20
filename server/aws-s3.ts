import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Request, Response } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';

interface UploadRequest extends Request {
  file?: Express.Multer.File & { location: string };
  s3Key: string;
}

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
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
    metadata: function (
      _: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, metadata?: Record<string, string>) => void,
    ) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (
      req: Request,
      _: Express.Multer.File,
      cb: (error: Error | null, key?: string) => void,
    ) {
      cb(null, (req as UploadRequest).s3Key);
    },
  }),
  fileFilter: function (_: Request, file: Express.Multer.File, cb) {
    if (!validExtension.includes(file.mimetype)) {
      return cb(new Error('Only JPG and PNG images are supported.'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
const singleFileUpload = upload.single('image');

const uploadSingleAWSFile = (req: UploadRequest, res: Response) => {
  req.s3Key = uuidv4();
  return new Promise((resolve, reject) => {
    return singleFileUpload(req, res, (err) => {
      if (err) {
        return reject(err);
      }
      if (!req.file) {
        return reject(new Error('No image file was uploaded.'));
      }
      return resolve({ downloadUrl: req.file.location, key: req.s3Key });
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
