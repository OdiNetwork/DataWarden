import { ListObjectsCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { s3 } from '@/lib/s3'

const BUCKET_NAME = 'odinetwork-docs_dev'

export async function listObjectsCommand() {
  const params = {
    Bucket: BUCKET_NAME,
  }

  const command = new ListObjectsCommand(params)

  const data = await s3.send(command)

  return data
}

export async function getObjectCommand(Key: string) {
  const params = {
    Bucket: BUCKET_NAME,
    Key,
  }
  const getObjectCommand = new GetObjectCommand(params)

  const response = await s3.send(getObjectCommand)

  return response
}
