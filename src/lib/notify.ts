import Notifier from 'node-notifier';
import { resolve } from 'path';
const icon = resolve(__dirname, './../icons/info.jpg');

export class Notify {
  public static info(
    title: string = 'Default title',
    message: string = 'Default message'
  ) {
    return Notifier.notify({
      title,
      message,
      icon, // Absolute path (doesn't work on balloons)
      sound: true, // Only Notification Center or Windows Toasters
      wait: false, // Wait with callback, until user action is taken against notification
    });
  }
}
