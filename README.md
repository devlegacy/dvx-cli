<h1 align="center">Devexteam CLI 🖥️</h1>

<h2 align="center">📦 Install</h2>

### macOS prerequisites

Some optimizers build native binaries from source and need these libraries:

```sh
brew install libpng libimagequant
brew link libpng
```

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
  dvx files:clean-sourcemaps  Clean sourcemaps
  dvx html:validate           Validate HTML files for syntax errors and best practices using
                              HTMLHint.
                              Read about rules on:
                              - https://github.com/htmlhint/HTMLHint/wiki/Rules
                              - https://htmlhint.com/docs/user-guide/list-rules
  dvx img:optimize            Comprehensive image optimization: minify, resize, and convert to
                              WebP format
  dvx img:resize              Resize images to specified dimensions while maintaining aspect
                              ratio
  dvx img:minify              Minify and optimize images for better web performance and smaller
                              file sizes
  dvx img:towebp              Convert images to WebP format for better web performance and
                              smaller file sizes

https://devexteam.com - © Copyright 2026
```

Run `dvx <command> --help` to see the options of a single command.

<h2 align="center">Synopsis</h2>

This CLI tool integrates and encapsulates essential utilities (`sharp`, `imagemin`, `HTMLHint`) to streamline the asset optimization process for images and HTML.

<h2 align="center">Recommendations</h2>

- Use in the **root project path**
- Use in a `bash`/`unix` console
- `sharp` is the default tool for resizing; nothing else needs to be installed for it.
- Optionally install [ImageMagick](https://www.imagemagick.org/script/download.php). It is only used when you pass `--tool mogrify` to `img:resize` or `img:optimize`, and `mogrify` must be available on your `PATH`.
- GraphicsMagick is not used by any command. It only shows up in the report printed by `dvx --version`.

<h2 align="center">Commands</h2>

### `img:minify`

Minify and optimize images (png, jpeg, jpg, gif, svg) for better web performance and smaller file sizes. Images whose optimized copy in the output directory is already newer than the source are skipped, so re-runs only touch changed images.

| Option | Alias | Default | Description |
| --- | --- | --- | --- |
| `--source` | `--src` | `src/assets/img/src` | Source directory containing unoptimized images (png, jpeg, jpg, gif, svg) |
| `--distribution` | `--dist` | `src/assets/img/dist` | Output directory where minified and optimized images will be saved |
| `--quality` | `-q` | `medium` | Compression quality preset: `high`, `medium` or `low` |

```sh
  dvx img:minify --src src/assets/img/src --dist src/assets/img/dist --quality high
```

### `img:towebp`

Convert images to WebP format for better web performance and smaller file sizes.

| Option | Alias | Default | Description |
| --- | --- | --- | --- |
| `--source` | `--src` | `src/assets/img/dist` | Source directory containing images to convert to WebP format |
| `--distribution` | `--dist` | `src/assets/img/dist/webp` | Output directory where converted WebP images will be saved |
| `--quality` | `-q` | `medium` | Compression quality preset: `high`, `medium` or `low` |

```sh
  dvx img:towebp --quality low
```

### `img:resize`

Resize images to the given dimensions while maintaining aspect ratio. Images that already fit within the target size are skipped. Resizing is done in place on the source directory.

| Option | Alias | Default | Description |
| --- | --- | --- | --- |
| `--source` | `--src` | `src/assets/img/dist` | Source directory containing images to resize |
| `--width` | `-w` | `1024` | Target width in pixels for resized images |
| `--height` | `-h` | none | Target height in pixels (optional, maintains aspect ratio if not set) |
| `--tool` | `-t` | `sharp` | Image processing tool: `sharp` or `mogrify` (requires ImageMagick) |
| `--exclude` | `-e` | `opengraph` | File patterns to exclude from resizing (space-separated) |

```sh
  dvx img:resize --src src/assets/img/dist --width 800 --exclude opengraph banner
```

### `img:optimize`

Comprehensive image optimization: minify, resize, and convert to WebP format. It accepts the options of the three commands above.

| Option | Alias | Default | Description |
| --- | --- | --- | --- |
| `--source` | `--src` | `src/assets/img/src` | Source directory containing unoptimized images to process |
| `--distribution` | `--dist` | `src/assets/img/dist` | Output directory for optimized images |
| `--width` | `-w` | `1024` | Target width for resized images in pixels |
| `--height` | `-h` | none | Target height for resized images in pixels (optional) |
| `--tool` | `-t` | `sharp` | Image processing tool for resizing: `sharp` or `mogrify` |
| `--exclude` | `-e` | `opengraph` | File patterns to exclude from processing (space-separated) |
| `--quality` | `-q` | `medium` | Compression quality preset: `high`, `medium` or `low` |

```sh
  dvx img:optimize --width 1280 --quality high
```

### Quality presets

The image commands share the `--quality` presets:

| Preset | JPEG quality | PNG quality range | WebP quality | Zopfli iterations |
| --- | --- | --- | --- | --- |
| `high` | 90 | 0.7 - 0.9 | 85 | 8 |
| `medium` (default) | 80 | 0.65 - 0.85 | 80 | 3 |
| `low` | 70 | 0.5 - 0.7 | 75 | 5 |

Image commands process files in parallel using worker threads and exit with code `1` when any file fails.

### `html:validate`

Validate HTML files for syntax errors and best practices using HTMLHint. See the [HTMLHint rules](https://htmlhint.com/docs/user-guide/list-rules).

| Option | Alias | Default | Description |
| --- | --- | --- | --- |
| `--source` | `--src` | `public` | Directory containing HTML files to validate |

```sh
  dvx html:validate --src dist
```

### `files:clean-sourcemaps`

Clean sourcemap comments (like `/*# sourceMappingURL=foo.css.map */`) from the CSS files of npm packages, since they can cause conflicts in the compiling or packaging process.

| Option | Alias | Default | Description |
| --- | --- | --- | --- |
| `--source` | `--src` | `./node_modules/` | Source path of the files |
| `--packages` | `--pkg` | `bootstrap-datepicker`, `tinymce` | List of npm packages with CSS files to clean |

```sh
  dvx files:clean-sourcemaps --pkg bootstrap-datepicker tinymce
```

<h2 align="center">Environment variables</h2>

| Variable | Description |
| --- | --- |
| `DVX_LOG_FORMAT` | Set to `json` to print one JSON object per line (useful for pipes, CI or log shippers). Any other value keeps the human-readable output. |
| `DVX_LOG_LEVEL` | Log threshold: `fatal`, `error`, `warn`, `info`, `debug`, `trace` or `silent`. Default `info`; unknown values fall back to `info`. |
| `NO_COLOR` | When set, disables colored output. |
| `FORCE_COLOR` | Forces colored output even when stdout is not a terminal. `FORCE_COLOR=0` disables colors. |

Warnings and errors are written to stderr and regular output to stdout, so stdout stays clean for pipes.

```sh
  DVX_LOG_FORMAT=json DVX_LOG_LEVEL=warn dvx img:minify
```

<h2 align="center">Directory structure example</h2>

📂 `project-root/`     
├─ 📂 `src/`     
│&nbsp;&nbsp;├─ 📂 `assets/`     
│&nbsp;&nbsp;│&nbsp;&nbsp;├─ 📂 `img/`     
│&nbsp;&nbsp;│&nbsp;&nbsp;│&nbsp;&nbsp;├─ 📂 `dist/`     
│&nbsp;&nbsp;│&nbsp;&nbsp;│&nbsp;&nbsp;└─ 📂  `src/`     

<h2 align="center">Sponsoring</h2>

Thank you for your support! :heart:. Your feedback is highly appreciated.
If you found this project useful and would like to support its development, or if you'd just like to buy me a coffee, you can do so via PayPal:

[![Donate](https://www.paypalobjects.com/en_US/MX/i/btn/btn_donateCC_LG.gif)](http://paypal.me/devlegacymx)
