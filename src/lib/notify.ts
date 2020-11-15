import Notifier from 'node-notifier';
import { platform } from 'os';
import { resolve } from 'path';
import { File } from './file';
const icon = resolve(__dirname);

export class Notify {
  private static readonly icon: string = File.find('./icons/info.jpg').info
    .absolutePath;
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
