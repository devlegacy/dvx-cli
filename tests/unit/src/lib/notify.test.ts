import { Notify } from '../../../../src/lib/notify';
import Notifier from 'node-notifier';
import NotificationCenter from 'node-notifier/notifiers/notificationcenter';

describe('Custom Notifier', () => {
  let notifier: jest.SpyInstance<
    NotificationCenter,
    [title?: string | undefined, message?: string | undefined]
  >;
  beforeEach(() => {
    notifier = jest
      .spyOn(Notify, 'info')
      .mockImplementation((title: string = '', message: string = '') => {
        return Notifier.notify();
      });
  });
  afterEach(() => {
    notifier.mockClear();
  });

  test('it send a notify', async () => {
    const notify = Notify.info();
    expect(notify).toBeInstanceOf(Notifier.WindowsToaster);
    expect(notify instanceof Notifier.WindowsToaster).toBeTruthy();
  });

  test('it send a notify once', () => {
    Notify.info('Title', 'Message');
    expect(notifier).toHaveBeenCalledTimes(1);
  });

  test('it send a notify with two params', () => {
    Notify.info('Title', 'Message');
    expect(notifier).toHaveBeenCalledWith('Title', 'Message');
  });

  test('it send a notify without params', () => {
    Notify.info();
    expect(notifier).toHaveBeenCalledWith();
  });

  test('it return the relative path to icon', () => {
    expect(Notify.icon).not.toBe('');
    expect(Notify.icon.includes('info.jpg')).toBeTruthy();
  });
});
