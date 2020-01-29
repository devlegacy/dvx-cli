# Devexteam CLI

<h2 id="" align="center">Install</h2>

```bash
  # Global
  npm install -g @devexteam/dvx-cli

  # In project
  npm install --save-dev @devexteam/dvx-cli
```

<h2 id="" align="center">Show current version</h2>

```bash
> dvx -v
```

<h2 id="" align="center">Show help</h2>

```bash
> dvx -h
```

```console
# Expected output:
Devexteam CLI
dvx <cmd> [args]

Commands:
  dvx files:clear-sourcemap-comments-in-css  Clean sourcemaps comments (/*#
                                             sourceMappingURL=foo.css.map */) in css files that
                                             can cause conflicts in compilation or packaging
  dvx html:validate                          Validate html files with htmlhint.
  dvx img:build                              Process images (minify, convert to webp and
                                             resize).
  dvx img:minify                             Minify images
  dvx img:resize                             Resize images to 1024px width
  dvx img:towebp                             Format/Convert images to webp

https://devexteam.com - Copyright 2020
```

<h2 id="" align="center">Synopsis</h2>

Integration and encapsulation of utilities (sharp, imagemin, htmlhint, ImageMagick, GraphicsMagick) and common use commands in the asset optimization process (images, html for the moment).

<h2 id="" align="center">Recommends</h2>

- Use in the **root project path**
- Use in a bash/unix console
- Install [ImageMagick](https://www.imagemagick.org/script/download.php)*
  - Has fallback to sharp
- Install [GraphicsMagick](http://www.graphicsmagick.org/download.html)*
  - Has fallback to sharp

<h2 id="" align="center">Recommend directory structure</h2>

+&nbsp;:open_file_folder: `project-name`

&nbsp;|&nbsp;&nbsp;+-- :open_file_folder: `src`

&nbsp;|&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;+-- :open_file_folder: `assets`

&nbsp;|&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;+-- :open_file_folder: `img`

&nbsp;|&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;+-- :file_folder: `dist`

&nbsp;|&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;+-- :file_folder: `src`


<h2 id="" align="center">Examples</h2>

### Images

![After img:build](https://raw.githubusercontent.com/devlegacy/dvx-cli/master/docs/minify.PNG)
![After img:build](https://raw.githubusercontent.com/devlegacy/dvx-cli/master/docs/towebp.PNG)
![After img:build](https://raw.githubusercontent.com/devlegacy/dvx-cli/master/docs/resize.PNG)

Result after run `dvx img:build`

![After img:build](https://raw.githubusercontent.com/devlegacy/dvx-cli/master/docs/after-build.PNG)

### HTML

![HTML validation without errors](https://raw.githubusercontent.com/devlegacy/dvx-cli/master/docs/validate.PNG)

![HTML validation with errors](https://raw.githubusercontent.com/devlegacy/dvx-cli/master/docs/validate-error.PNG)

<h2 id="" align="center">Sponsoring</h2>

Thank you for reading :heart:. The feedback is appreciated.
If you liked the project, it has been useful and you want to support the development or you simply want to invite me a coffee, you can do it via paypal with the following link:

[![Donate](https://www.paypalobjects.com/en_US/MX/i/btn/btn_donateCC_LG.gif)](http://paypal.me/devlegacymx)

