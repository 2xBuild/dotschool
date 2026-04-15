import { GetObjectCommand, S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing env var: ${name}`);
  return val;
}

function getR2BucketName() {
  return requireEnv("R2_BUCKET_NAME");
}

function getClient() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${requireEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
    // R2 is not fully compatible with AWS SDK default request checksums (e.g. x-amz-checksum-crc32).
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
}

function getR2PublicObjectUrl(key: string): string {
  const publicUrl = requireEnv("R2_PUBLIC_URL").replace(/\/+$/, "");
  return `${publicUrl}/${key}`;
}

export async function uploadToR2(
  file: Buffer,
  key: string,
  contentType: string,
): Promise<string> {
  const bucket = requireEnv("R2_BUCKET_NAME");
  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
    }),
  );

  return getR2PublicObjectUrl(key);
}

export async function getR2ObjectStream(key: string) {
  const out = await getClient().send(
    new GetObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
    }),
  );
  if (!out.Body) {
    return null;
  }
  return {
    body: out.Body,
    contentType: out.ContentType ?? "application/octet-stream",
    cacheControl: out.CacheControl,
  };
}
