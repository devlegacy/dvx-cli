const Logger = require('../../../../src/helpers/console');

test('it returns log from console', () => {
  const spyLog = jest.spyOn(Logger, 'log').mockImplementation(() => {
    return console.log;
  });
  Logger.log();
  expect(spyLog).toBeCalled();
  expect(spyLog).toHaveBeenCalledTimes(1);
  expect(spyLog).toHaveReturnedWith(console.log);
});
