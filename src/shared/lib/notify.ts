import { notify } from 'node-notifier';
import { File } from './file';

const messages = ['info', 'done', 'fail'];
const icons = messages.reduce((icons: Record<string, string>, icon) => {
  if (!(icon in icons)) icons[icon] = File.find(`../../../assets/icons/${icon}.jpg`, __dirname).info.absolutePath;
  return icons;
}, {});

export class Notify {
  static info(title = '📌 Default info ℹ title', message = '💬 Default message') {
    notify({
      title,
      message,
      icon: icons.info,
      sound: true
    });
  }

  static done(title = '📌 Default done ✅ title', message = '💬 Default message') {
    notify({
      title,
      message,
      icon: icons.done,
      sound: true
    });
  }

  static fail(title = '📌 Default error ❌ title', message = '💬 Default message') {
    notify({
      title,
      message,
      icon: icons.fail,
      sound: true
    });
  }
}
