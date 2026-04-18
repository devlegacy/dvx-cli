import pino from 'pino';
import { default as PinoPretty } from 'pino-pretty';

export const MESSAGE_KEY = 'message';
const level = 'trace';
const stream = PinoPretty({
  colorize: true,
  ignore: 'pid,hostname',
  levelFirst: true,
  translateTime: 'yyyy-mm-dd HH:MM:ss',
});

export const streams = [
  {
    stream,
  },
];

/**
 * Read more on: https://getpino.io/#/
 */
export const logger = pino.pino(
  {
    level,
    base: null,
  },
  pino.multistream(streams),
);

export const info = logger.info.bind(logger);
export const warn = logger.warn.bind(logger);
export const error = logger.error.bind(logger);
