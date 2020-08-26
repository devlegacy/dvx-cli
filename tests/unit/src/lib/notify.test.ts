import { Notify } from '../../../../src/lib/notify';
import Notifier from 'node-notifier';

const spy = jest
  .spyOn(Notify, 'info')
  .mockImplementation((title: string = '', message: string = '') => {
    return Notifier.notify();
  });
afterEach(() => {
  spy.mockClear();
});
test('it send a notify', () => {
  Notify.info('Title', 'Message');
  expect(spy).toHaveBeenCalled();
});

test('it send a notify once', () => {
  Notify.info('Title', 'Message');
  expect(spy).toHaveBeenCalledTimes(1);
});

test('it send a notify with two params', () => {
  Notify.info('Title', 'Message');
  expect(spy).toHaveBeenCalledWith('Title', 'Message');
});

test('it send a notify without params', () => {
  Notify.info();
  expect(spy).toHaveBeenCalledWith();
});

test('it return a instance of Notifier.WindowsToaster', () => {
  const notify = Notify.info();
  expect(notify instanceof Notifier.WindowsToaster).toBeTruthy();
});
