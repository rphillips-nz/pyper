const path = require('path');
const sharp = require('sharp');
const fs = require('fs').promises;
const fg = require('fast-glob');

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

async function processFilePath(filePath, rule) {
	const outputFilePath = getOutputPath(filePath, rule.output);
	const convert = sharp(filePath);

	if (rule.options?.format) {
		convert.toFormat(rule.options?.format);
	}

	const { data } = await convert
		.resize(rule.width, rule.height)
		.jpeg({ quality: rule.options?.quality, force: false })
		.png({ compressionLevel: rule.options?.compressionLevel, force: false })
		.toBuffer({ resolveWithObject: true });

	console.log(`From ${filePath} to ${outputFilePath}`);
	await fs.mkdir(path.dirname(outputFilePath), { recursive: true });
	await fs.writeFile(outputFilePath, data);
}

async function processRule(rule) {
	const filePaths = await fg(rule.input);
	console.log(`Found ${filePaths.length} path${filePaths.length === 1 ? '' : 's'} for ${rule.input}`);
	await Promise.all(filePaths.map(async (filePath) => await processFilePath(filePath, rule)));
}

module.exports = {
	processRule
};
