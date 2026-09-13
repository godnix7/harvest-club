import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.R2_ACCOUNT_ID || "";
const accessKeyId = process.env.R2_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export async function generateUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME || "harvest-club-media",
    Key: key,
    ContentType: contentType,
  });

  // URL expires in 15 minutes
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
  
  return {
    uploadUrl: signedUrl,
    publicUrl: `${process.env.R2_PUBLIC_URL}/${key}`,
  };
}
