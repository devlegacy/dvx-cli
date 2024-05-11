import { spawnSync, type SpawnSyncReturns } from 'node:child_process'

const validateCommand = (command: SpawnSyncReturns<Buffer>, errorMessage: string) => {
  return !command.error
    ? command.stdout
        .toString()
        .split('\n')
        .filter((data) => data.length > 0)
        .shift() || ''
    : errorMessage
}

const messages = {
  magick: '🔽 Download on: 🔗 http://www.graphicsmagick.org/download.html',
  gm: '🔽 Download on: 🔗 https://www.imagemagick.org/script/download.php',
}

class Shell {
  static get imageMagick() {
    const command = 'magick'
    let response = ''
    try {
      const magick = spawnSync(command, ['-version'])
      response = validateCommand(magick, messages[command])
    } catch {
      response = messages[command]
    }

    return response
  }

  static get graphicMagick() {
    const command = 'gm'
    let response = ''
    try {
      const gm = spawnSync(command, ['-version'])
      response = validateCommand(gm, messages[command])
    } catch {
      response = messages[command]
    }
    return response
  }
}

export default Shell
