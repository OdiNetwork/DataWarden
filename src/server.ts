import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { Readable } from 'stream'
import { listObjectsCommand, getObjectCommand } from './functions/s3'
import { createBackup } from './functions/archiver'

const BACKUP_DIR = './data/dist'
const LOCAL_RECORD_FILE = './data/mapping/records.json'

function loadLocalRecord() {
  const mappingFolderPath = path.dirname(LOCAL_RECORD_FILE)
  if (!fs.existsSync(mappingFolderPath)) {
    fs.mkdirSync(mappingFolderPath, { recursive: true })
  }

  if (fs.existsSync(LOCAL_RECORD_FILE)) {
    return JSON.parse(fs.readFileSync(LOCAL_RECORD_FILE, 'utf8'))
  }

  return {}
}

function saveLocalRecord(record: Record<string, string>) {
  fs.writeFileSync(LOCAL_RECORD_FILE, JSON.stringify(record), 'utf8')
}

async function syncObjects(localRecord: Record<string, string>) {
  try {
    const data = await listObjectsCommand()
    const objects = data.Contents || []

    for (const obj of objects) {
      const s3ObjectKey = obj.Key
      if (!s3ObjectKey) return

      if (!localRecord[s3ObjectKey] || localRecord[s3ObjectKey] !== obj.ETag) {
        const localFilePath = path.join(BACKUP_DIR, s3ObjectKey)

        const response = await getObjectCommand(s3ObjectKey)
        const readableStream = response.Body as Readable

        const folderPath = path.dirname(localFilePath)

        console.log(folderPath)

        try {
          fs.mkdirSync(folderPath, { recursive: true })
          console.log(`Pasta criada: ${folderPath}`)
        } catch (error) {
          console.error(`Erro ao criar a pasta: ${folderPath}`, error)
        }

        const fileWriteStream = fs.createWriteStream(localFilePath)

        await new Promise((resolve, reject) => {
          readableStream
            .pipe(fileWriteStream)
            .on('error', reject)
            .on('finish', resolve)
        })

        if (!obj.ETag) return
        localRecord[s3ObjectKey] = obj.ETag
      }
    }

    for (const localObjectKey in localRecord) {
      if (!objects.some((obj) => obj.Key === localObjectKey)) {
        const localFilePath = path.join(BACKUP_DIR, localObjectKey)
        fs.unlinkSync(localFilePath)
        delete localRecord[localObjectKey]
      }
    }

    saveLocalRecord(localRecord)
  } catch (error) {
    console.error('Erro ao sincronizar objetos com o S3:', error)
  }
}

const localRecord = loadLocalRecord()
syncObjects(localRecord)
createBackup(BACKUP_DIR)
