/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { S3Client } from '@aws-sdk/client-s3'

export const s3 = new S3Client({
  region: process.env.OBJECT_STORAGE_ORIGIN_REGION,
  endpoint: process.env.OBJECT_STORAGE_ORIGIN_ENDPOINT,
  credentials: {
    accessKeyId: process.env.OBJECT_STORAGE_ORIGIN_KEY_ID!,
    secretAccessKey: process.env.OBJECT_STORAGE_ORIGIN_SECRET!,
  },
})
