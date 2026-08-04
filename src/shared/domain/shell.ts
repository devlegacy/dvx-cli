import { type SpawnSyncReturns, spawnSync } from 'node:child_process'

const validateCommand = (command: SpawnSyncReturns<Buffer>, errorMessage: string) => {
  if (command.error || command.status !== 0) {
    return errorMessage
  }

  const output = command.stdout.toString().trim()
  if (!output) {
    return errorMessage
  }

  // Extract first non-empty line containing version info
  const lines = output.split('\n').filter((line) => line.trim().length > 0)
  return lines[0] || errorMessage
}

const messages = {
  magick: '🔽 Download here 🔗 https://www.imagemagick.org/script/download.php',
  gm: '🔽 Download here 🔗 http://www.graphicsmagick.org/download.html',
}

class Shell {
  static exists(command: string, args: readonly string[] = []) {
    try {
      const result = spawnSync(command, args, {
        timeout: 5000,
      })
      return !result.error
    } catch {
      return false
    }
  }

  static get imageMagick() {
    const command = 'magick'
    try {
      const result = spawnSync(
        command,
        [
          '-version',
        ],
        {
          timeout: 5000,
        },
      )
      return validateCommand(result, messages[command])
    } catch {
      return messages[command]
    }
  }

  static get graphicMagick() {
    const command = 'gm'
    try {
      const result = spawnSync(
        command,
        [
          '-version',
        ],
        {
          timeout: 5000,
        },
      )
      return validateCommand(result, messages[command])
    } catch {
      return messages[command]
    }
  }
}

export { Shell }
