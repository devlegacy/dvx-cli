import { log, warn, error } from '../../../../src/helpers/console';
const Logger = require('../../../../src/helpers/console');

describe('Custom console logger', () => {
  test('it returns custom and format console.log', () => {
    console.log = jest.fn();
    log('log');
    expect(console.log).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(
      '\x1b[42m\x1b[30m\x1b[1m%s\x1b[0m',
      '[dvx]:',
      'log'
    );
    expect((console.log as jest.Mock).mock.calls[0][2]).toBe('log');
  });

  test('it returns custom and format console.warn', () => {
    console.warn = jest.fn();
    warn('warn');
    expect(console.warn).toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      '\x1b[43m\x1b[30m\x1b[1m%s\x1b[0m',
      '[dvx]:',
      'warn'
    );
    expect((console.warn as jest.Mock).mock.calls[0][2]).toBe('warn');
  });

  test('it returns custom and format console.error', () => {
    console.error = jest.fn();
    error('error');
    expect(console.error).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      '\x1b[41m\x1b[1m%s\x1b[0m',
      '[dvx]:',
      'error'
    );
    expect((console.error as jest.Mock).mock.calls[0][2]).toBe('error');
  });

  test('it returns custom and log from console', () => {
    const spyLog = jest.spyOn(Logger, 'log').mockImplementation(() => {
      return console.log;
    });
    Logger.log();
    expect(spyLog).toBeCalled();
    expect(spyLog).toHaveBeenCalledTimes(1);
    expect(spyLog).toHaveReturnedWith(console.log);
  });
});
