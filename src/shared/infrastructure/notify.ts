// import NodeNotifier from 'node-notifier'
// import { File } from './file.js'

// const { notify } = NodeNotifier
// const __dirname = new URL('.', import.meta.url).pathname
// const BASE_ICON_PATH = '../../../assets/icons'
// const iconFinder = (icon: string) =>
//   File.find(`${BASE_ICON_PATH}/${icon}`, __dirname).info.absolutePath

// const messages = {
//   info: {
//     icon: iconFinder('info.jpg'),
//     fallback: 'ℹ',
//   },
//   done: {
//     icon: iconFinder('done.jpg'),
//     fallback: '✅',
//   },
//   fail: {
//     icon: iconFinder('fail.jpg'),
//     fallback: '❌',
//   },
// }

// const timeout = 0

// export class Notify {
//   static info(title = 'ℹ Default info title 📌', message = 'Default message 💬') {
//     setTimeout(() => {
//       notify({
//         title,
//         message,
//         icon: messages.info.icon || messages.info.fallback,
//         sound: true,
//         wait: false,
//       })
//     }, timeout)
//   }

//   static done(title = '✅ Default done title 📌', message = 'Default message 💬') {
//     setTimeout(() => {
//       notify({
//         title,
//         message,
//         icon: messages.done.icon || messages.done.fallback,
//         sound: true,
//         wait: false,
//       })
//     }, timeout)
//   }

//   static fail(title = '❌ Default error title 📌', message = 'Default message 💬') {
//     setTimeout(() => {
//       notify({
//         title,
//         message,
//         icon: messages.fail.icon || messages.fail.fallback,
//         sound: true,
//         wait: false,
//       })
//     }, timeout)
//   }
// }
