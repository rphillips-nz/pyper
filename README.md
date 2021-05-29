<p align="center"><img src="https://raw.githubusercontent.com/rphillips-nz/exif-reader/main/sandpiper.svg" alt="Unrelated image of a sandpiper" width="380"></p>
<h1 align="center">Pyper</h1>
<p align="center">The uncomplicated image resizing pipeline.</p>

&nbsp;

[Features](#features)
&bull;
[Usage](#usage)
&bull;
[Development](#development)
&bull;
[License](#license)

---

## Features

- 📄 Supports any image type supported by sharp/libvips
- 📏 Multiple input rules each with multiple outputs
- ✳️ Glob input file selection
- 🚀 Fast resizing with sharp/libvips
- 👀 Skips already-resized images with a cache for fast subsequent runs

## Usage

Create a `.pyper.json` file in the folder you want to run pyper from.
Here's one that creates three different versions of each of the images in the `images` folder.

```
[
	{
		"input": "images/*",
		"outputs": [
			{
				"path": "output/{basepath}/{filename}-35{extension}",
				"width": 35,
				"height": 35
			},
			{
				"path": "output/{basepath}/{filename}-100.webp",
				"format": "webp",
				"width": 100,
				"height": 100
			},
			{
				"path": "output/{basepath}/{filename}-100{extension}",
				"width": 100,
				"height": 100,
				"options": {
					"quality": 10
				}
			}
		]
	}
]
```

## Development

Pyper is run as the CLI command `pyper`.

```sh
npm install
npm link
```

You should then be able to run this in another folder:

```sh
pyper
```

## License

MIT
