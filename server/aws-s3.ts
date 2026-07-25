import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const s3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.S3_ACCESS_SECRET as string,
  },
});

const createPresignedUploadUrl = (
  key: string,
  contentType: string,
  expectedSize: number,
) => {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: contentType,
    ContentLength: expectedSize,
  });
  return getSignedUrl(s3, command, { expiresIn: 5 * 60 });
};

const inspectUploadedImage = async (key: string) => {
  const head = await s3.send(
    new HeadObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
    }),
  );
  const contentLength = head.ContentLength;
  if (contentLength === undefined) {
    throw new Error('Uploaded object has no content length.');
  }

  const object = await s3.send(
    new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Range: 'bytes=0-4099',
    }),
  );
  if (!object.Body) {
    throw new Error('Uploaded object has no body.');
  }

  const prefix = Buffer.from(await object.Body.transformToByteArray());
  const detectedType = await fileTypeFromBuffer(prefix);
  return {
    contentLength,
    contentType: detectedType?.mime ?? null,
  };
};

const createTileThumbnail = async (key: string) => {
  const object = await s3.send(
    new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
    }),
  );
  if (!object.Body) {
    throw new Error('Uploaded object has no body.');
  }

  const original = Buffer.from(await object.Body.transformToByteArray());
  const thumbnail = await sharp(original)
    .rotate()
    .resize(552, 380, { fit: 'cover', position: 'attention' })
    .webp({ quality: 78 })
    .toBuffer();
  const thumbnailKey = `tiles/${key}.webp`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: thumbnailKey,
      Body: thumbnail,
      ContentType: 'image/webp',
      CacheControl: 'private, max-age=31536000, immutable',
    }),
  );
  return thumbnailKey;
};

const getPresignedUrls = (keys: string[]) =>
  Promise.all(keys.map((key) => getPresignedUrl(key)));

const getPresignedUrl = (key: string) => {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  });
  return getSignedUrl(s3, command, { expiresIn: 15 * 60 });
};

const deleteAWSFiles = (keys: string[]) =>
  Promise.all(keys.map((key) => deleteSingleAWSFile(key)));

const deleteSingleAWSFile = (key: string) =>
  s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
    }),
  );

export {
  createTileThumbnail,
  createPresignedUploadUrl,
  deleteAWSFiles,
  deleteSingleAWSFile,
  getPresignedUrl,
  getPresignedUrls,
  inspectUploadedImage,
};
