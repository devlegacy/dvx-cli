import { NotificationCallback, notify } from 'node-notifier';
import { platform } from 'os';
import { File } from './file';

const iconDir = 'assets/icons/info.jpg';

const icon = File.find(`../../../${iconDir}`, __dirname);

export class Notify {
  public static readonly icon: string = icon.info.absolutePath;

  public static info(title: string = 'Default title', message: string = 'Default message') {
    return notify({
      title,
      message,
      icon: Notify.icon, // Absolute path (doesn't work on balloons)
      sound: true, // Only Notification Center or Windows Toasters
      wait: true // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
    });
  }
}
