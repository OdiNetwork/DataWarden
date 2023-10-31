import archiver from 'archiver'
import fs from 'fs'
import path from 'path'

export function createBackup(backupDir: string) {
  const currentDate = new Date()
  const formattedDate = currentDate
    .toISOString()
    .slice(0, 16)
    .replace(/[:T\-.]/g, '_')
  const outputZipFileName = `Backup-${formattedDate}.zip`
  const outputZipPath = path.join('./data', outputZipFileName)

  const archive = archiver('zip', { zlib: { level: 9 } })

  const output = fs.createWriteStream(outputZipPath)

  output.on('close', () => {
    console.log(`Arquivo zip criado com ${archive.pointer()} bytes`)
  })

  archive.on('error', (err) => {
    throw err
  })

  archive.pipe(output)
  archive.directory(backupDir, false)
  archive.finalize()
}
