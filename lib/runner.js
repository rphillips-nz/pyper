const path = require('path');
const sharp = require('sharp');
const fs = require('fs').promises;
const fg = require('fast-glob');
const util = require('util');
const execFile = util.promisify(require('child_process').execFile);

function getPathParts(filePath) {
	const extension = path.extname(filePath);
	return {
		extension: extension,
		filename: path.basename(filePath, extension),
		basepath: path.dirname(filePath)
	};
}

function getOutputPath(filePath, output) {
	const { extension, filename, basepath } = getPathParts(filePath);
	return output
		.replace('{basepath-1}', basepath.substring(basepath.indexOf('/', 1) + 1))
		.replace('{basepath}', basepath)
		.replace('{filename}', filename)
		.replace('{extension}', extension)
		.replace(/\/+/, '/');
}

async function writeFile(filePath, data) {
	await fs.mkdir(path.dirname(filePath), { recursive: true });
	await fs.writeFile(filePath, data);
}

async function getResizedBuffer(inputBuffer, output) {
	const convert = sharp(inputBuffer);

	if (output.options?.format) {
		convert.toFormat(output.options?.format);
	}

	const { data } = await convert
		.resize(output.width, output.height)
		.jpeg({ quality: output.options?.quality, force: false })
		.png({ compressionLevel: output.options?.compressionLevel, force: false })
		.toBuffer({ resolveWithObject: true });

	return data;
}

async function processFilePath(filePath, output, cache, hash, verbose) {
	const outputFilePath = getOutputPath(filePath, output.path);
	const inputBuffer = await fs.readFile(filePath);
	const cacheKey = `${filePath}|${outputFilePath}`;
	const isCached = cache[cacheKey] === hash;

	if (verbose) {
		console.log(`${isCached ? 'Skipping' : 'Resizing'} ${filePath} to ${outputFilePath}`);
	}

	if (!isCached) {
		const data = await getResizedBuffer(inputBuffer, output);
		await writeFile(outputFilePath, data);
		cache[cacheKey] = hash;
	}

	return isCached;
}

async function processRule(rule, { cache, md5Path, verbose }) {
	const paths = await fg(rule.input);

	console.log(`Found ${paths.length} image${paths.length === 1 ? '' : 's'} for ${rule.input}`);

	const allPromises = rule.outputs.reduce((memo, output) => {
		return memo.concat(paths.map(async (filePath) => {
			const { stdout } = await execFile(md5Path, [filePath]);
			const hash = stdout.split(' = ')[1].trim();
			return await processFilePath(filePath, output, cache, hash, verbose);
		}));
	}, []);

	const cacheResults = await Promise.all(allPromises);
	const cached = cacheResults.filter((isCached) => isCached).length;
	const resized = cacheResults.length - cached;

	console.log(`Cached: ${cached} image${cached === 1 ? '' : 's'} for ${rule.input}`);
	console.log(`Resized: ${resized} image${resized === 1 ? '' : 's'} for ${rule.input}`);

	await writeFile('.pyper/cache.json', JSON.stringify(cache, null, 2));
}

module.exports = {
	processRule
};
