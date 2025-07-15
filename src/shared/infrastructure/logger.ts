import { default as PinoPretty } from 'pino-pretty'
import pino from 'pino'
import process from 'process'

export const MESSAGE_KEY = 'message'
const level = 'trace'
const stream = true
  ? PinoPretty({
      colorize: true,
      ignore: 'pid,hostname',
      levelFirst: true,
      translateTime: 'yyyy-mm-dd HH:MM:ss',
      // messageKey: MESSAGE_KEY,
      level,
    })
  : process.stdout

export const streams = [{ stream }]
// console.log(streams)
/**
 * Read more on: https://getpino.io/#/
 */
export const logger = pino.pino(
  {
    level,
    // messageKey: MESSAGE_KEY,
    base: null,
  },
  pino.multistream(streams),
)

export const info = logger.info.bind(logger)
export const warn = logger.warn.bind(logger)
export const error = logger.error.bind(logger)

// info({ message: 'Hello, info' })
info({ message: { data: [{ numbers: 100 }] } }, 'another message')
info({ message: { data: [{ numbers: 100 }] } })
// info('Hello, info')
// warn({ message: 'Hello, warn' })
// warn({ message: { data: [{ numbers: 100 }] } })
// warn('Hello, warn')
// error({ message: 'Hello, error' })
// error({ message: { data: [{ numbers: 100 }] } })
// error('Hello, error')
