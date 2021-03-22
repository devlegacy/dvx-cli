import { NotificationCallback, notify } from 'node-notifier';
import { platform } from 'os';
import { File } from './file';
const icon = File.find('../../assets/img/icons/info.jpg', __dirname);

export class Notify {
  public static readonly icon: string = icon.isFile()
    ? icon.info.absolutePath
    : File.find('../assets/img/icons/info.jpg', __dirname).info.absolutePath;

  public static info(
    title: string = 'Default title',
    message: string = 'Default message',
    cb?: NotificationCallback | undefined
  ) {
    return notify(
      {
        title,
        subtitle: 'subtitle',
        message,
        contentImage: Notify.icon,
        icon: ['win32', 'linux'].includes(platform()) ? Notify.icon : undefined, // Absolute path (doesn't work on balloons)
        sound: true, // Only Notification Center or Windows Toasters
        wait: false, // Wait with callback, until user action is taken against notification,
        timeout: 2,
        // time: 2,
      },
      cb
    );
  }
}
