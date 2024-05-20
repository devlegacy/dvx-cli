<h1 align="center">Devexteam CLI 🖥️</h1>

<h2 align="center">📦 Install</h2>

### Global installation

To install the CLI tool globally, run the following command:
```sh
  npm install -g @devexteam/dvx-cli
```

### Local installation in a project

**As a development dependency**
To install the CLI tool as a development dependency in your personal project, run the following command:
```sh
  npm install --save-dev @devexteam/dvx-cli
```

**As an optional dependency**
To install the CLI tool as an optional dependency, run the following command:
```sh
  npm install --save-optional @devexteam/dvx-cli
```

<h2 align="center">🚀 How to use</h2>
<h3 align="center">Show current version</h3>

```sh
  dvx --version
```

<h3 align="center">🔍 Show help</h3>

```sh
  dvx --help
```

Expected output:
```console
Devexteam CLI
Recommend usage: dvx <cmd> [args]

Commands:
  dvx img:minify              Minify images
  dvx img:towebp              Format/Convert images to webp
  dvx img:resize              Resize images, fixes to 1024px width
  dvx img:optimize            Process images (minify, convert to webp and resize).
  dvx html:validate           Validate html files with htmlhint.
                              Read about rules on:
                              - https://github.com/htmlhint/HTMLHint/wiki/Rules
                              - https://htmlhint.com/docs/user-guide/list-rules
  dvx files:clean-sourcemaps  Clean sourcemaps comments (like /*# sourceMappingURL=foo.css.map
                              */) from your CSS files. They can cause conflict in the compiling
                              or packaging process.

```

<h2 align="center">Synopsis</h2>

This CLI tool integrates and encapsulates essential utilities (`sharp`, `imagemin`, `HTMLHint`, `ImageMagick`, `GraphicsMagick`) to streamline the asset optimization process for images and HTML.

<h2 align="center">Recommendations</h2>

- Use in the **root project path**
- Use in a `bash`/`unix` console
- Install [ImageMagick](https://www.imagemagick.org/script/download.php)*
  - The CLI has a fallback to sharp
- Install [GraphicsMagick](http://www.graphicsmagick.org/download.html)*
  - The CLI has a fallback to sharp

<h2 align="center">Directory structure example</h2>

📂 `project-root/`     
├─ 📂 `src/`     
│  ├─ 📂 `assets/`     
│  │  ├─ 📂 `img/`     
│  │  │  └─ 📂 `dist/`     
│  │  │  └─ 📂  `src/`     

<h2 align="center">Sponsoring</h2>

Thank you for your support! :heart:. Your feedback is highly appreciated.
If you found this project useful and would like to support its development, or if you'd just like to buy me a coffee, you can do so via PayPal:

[![Donate](https://www.paypalobjects.com/en_US/MX/i/btn/btn_donateCC_LG.gif)](http://paypal.me/devlegacymx)
