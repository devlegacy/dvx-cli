const notify = require('node-notifier');

class Notify {
  info({ title, message } = data) {
    notifier.notify({
      title: title || 'Default title',
      message: message || 'Default message',
      icon: path.resolve(__dirname, './../icons/info.jpg'), // Absolute path (doesn't work on balloons)
      sound: true, // Only Notification Center or Windows Toasters
      wait: false, // Wait with callback, until user action is taken against notification
    });
  }
}

module.exports = new Notify();
