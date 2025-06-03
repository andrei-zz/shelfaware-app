import { createImageSchema, createImage } from "./insert.server";
import { putS3Object } from "./s3.server";

export const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024;

export const uploadImage = async (
  imageFile: File | null | undefined,
  payload?: Record<string, unknown>
) => {
  if (
    imageFile?.size != null &&
    imageFile.size > 0 &&
    imageFile.size <= MAX_IMAGE_FILE_SIZE
  ) {
    const s3Key = crypto.randomUUID();
    const arrayBuffer = await imageFile.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    const parsed = createImageSchema.parse({
      ...payload,
      s3Key,
      mimeType: imageFile.type,
    });
    const [image] = await Promise.all([
      createImage(parsed),
      ...(imageBuffer != null ? [putS3Object(s3Key, imageBuffer)] : []),
    ]);
    return image;
  }
};
