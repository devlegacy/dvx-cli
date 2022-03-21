# Devexteam CLI

<h2 id="" align="center">📦 Install</h2>

```sh
  # Global
  npm install -g @devexteam/dvx-cli
```

```sh
  # In personal project
  ## As dev dependency
  npm install --save-dev @devexteam/dvx-cli
  ## As optional dependency
  npm install --save-optional @devexteam/dvx-cli
```

<h2 id="" align="center">🚀 How to use</h2>
<h3 id="" align="center">Show current version</h3>

```sh
  dvx --version
```

<h3 id="" align="center">🔍 Show help</h3>

```sh
  dvx --help
```

```console
# Expected output:
Devexteam CLI
Recommend usage: dvx <cmd> [args]

Commands:
  dvx img:minify              Minify images
  dvx img:towebp              Format/Convert images to webp
  dvx img:resize              Resize images to 1024px width
  dvx img:build               Process images (minify, convert to webp and resize).
  dvx html:validate           Validate html files with htmlhint.
                              Read about rules on:
                              - https://github.com/htmlhint/HTMLHint/wiki/Rules
                              - https://htmlhint.com/docs/user-guide/list-rules
  dvx files:clean-sourcemaps  Clean sourcemaps comments (/*# sourceMappingURL=foo.css.map */)
                              in css files that can cause conflicts in compilation or packaging

https://devexteam.com - Copyright 2022
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


:open_file_folder: `project-name/`

├─ :open_file_folder: `src/`

│  ├─ :open_file_folder: `assets/`

│  │  ├─ :open_file_folder: `img/`

│  │  │  ├─ :open_file_folder: `dist/`

│  │  │  ├─ :open_file_folder: `src/`


:open_file_folder: `project-name/`

└── :open_file_folder: `src/`

    └── :open_file_folder: `assets/`
    
        └── :open_file_folder: `img/`
        
            ├── :open_file_folder: `dist`
            
            └── :open_file_folder: `src`
            

:open_file_folder: `project-name/`

└──&nbsp;:open_file_folder: `src/`

&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;:open_file_folder: `assets/`

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;:open_file_folder: `img/`

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;:open_file_folder: `dist`

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;:open_file_folder: `src`


<h2 id="" align="center">Examples</h2>

### Images
<!-- https://raw.githubusercontent.com/devlegacy/dvx-cli/master/assets/ -->
![After img:build](./assets/img/minify.png)
![After img:build](./assets/img/towebp.png)
![After img:build](./assets/img/resize.png)

Result after run `dvx img:build`

![After img:build](./assets/img/after-build.png)

### HTML

![HTML validation without errors](./assets/img/validate.png)

![HTML validation with errors](./assets/img/validate-error.png)

<h2 id="" align="center">Sponsoring</h2>

Thank you for reading :heart:. The feedback is appreciated.
If you liked the project, it has been useful and you want to support the development or you simply want to invite me a coffee, you can do it via paypal with the following link:

[![Donate](https://www.paypalobjects.com/en_US/MX/i/btn/btn_donateCC_LG.gif)](http://paypal.me/devlegacymx)
