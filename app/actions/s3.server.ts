import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

if (
  !process.env.S3_REGION ||
  !process.env.S3_ACCESS_KEY ||
  !process.env.S3_SECRET_KEY ||
  !process.env.S3_BUCKET_NAME
) {
  throw new Error(
    "Must provide both S3_REGION, S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET_NAME in .env"
  );
}

const s3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
});

export const putS3Object = async (key: string, buffer: Buffer<ArrayBuffer>) => {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME, // required
    Key: key, // required
    Body: buffer, // see \@smithy/types -> StreamingBlobPayloadInputTypes
  });
  return await s3.send(command);
};

// export const getS3Object = async (key: string) => {
//   const command = new GetObjectCommand({
//     Bucket: process.env.AWS_S3_BUCKET_NAME,
//     Key: key,
//   });

//   try {
//     const response = await s3.send(command);

//     if (!response.Body) {
//       throw new Error(`S3 object has no body for key: ${key}`);
//     }

//     return response;
//   } catch (err) {
//     console.error("Error fetching S3 object:", err);
//     throw err;
//   }
// };

export const getSignedS3Url = async (
  key: string,
  expiresIn = 2 * 60 * 60
): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3, command, { expiresIn });
};
