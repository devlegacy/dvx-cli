import { join } from 'node:path'
import { existsSync, lstatSync, readdirSync, rmdirSync, unlinkSync } from 'node:fs'

export function emptyDirSync(path: string) {
  if (!existsSync(path)) return
  readdirSync(path).forEach((file) => {
    const curPath = join(path, file)
    if (lstatSync(curPath).isDirectory()) {
      emptyDirSync(curPath)
      rmdirSync(curPath)
    } else {
      unlinkSync(curPath)
    }
  })
}
