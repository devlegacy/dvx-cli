import Notifier from 'node-notifier';
import { platform } from 'os';
import { File } from './file';
const icon = File.find('./src/icons/info.jpg').info;

export class Notify {
  public static readonly icon: string = icon.isFile ? icon.absolutePath : '';
  public static info(
    title: string = 'Default title',
    message: string = 'Default message'
  ) {
    return Notifier.notify({
      title,
      message,
      contentImage: Notify.icon,
      icon: ['win32', 'linux'].includes(platform()) ? Notify.icon : undefined, // Absolute path (doesn't work on balloons)
      sound: true, // Only Notification Center or Windows Toasters
      wait: false, // Wait with callback, until user action is taken against notification,
    });
  }
}
