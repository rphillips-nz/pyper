#!/usr/bin/env node

const fs = require('fs').promises;
const runner = require('./runner')
const { lookpath } = require('lookpath');
const { program } = require('commander');

program.version('0.0.1', '-v, --version', 'output the current version');
program.option('--verbose', 'output debugging');
program.parse(process.argv);

const { verbose } = program.opts();

async function getCache() {
	try {
		const raw = await fs.readFile('.pyper/cache.json');
		return JSON.parse(raw);
		console.log('Cache found at .pyper/cache.json.');
	} catch {
		console.log('Cache not found, starting new cache.');
	}
}

async function getConfigRules() {
	try {
		const raw = await fs.readFile('.pyper.json');
		return JSON.parse(raw);
		console.log('Config found at .pyper.json.');
	} catch {
		console.log('Config not found, create a .pyper.json file in this folder.');
		process.exit(1);
	}
}

async function getMd5Path() {
	let md5Path = await lookpath('md5');
	md5Path = md5Path ?? await lookpath('md5sum');

	if (md5Path) {
		console.log(`MD5 tool found at ${md5Path}`);
		return md5Path;
	}

	console.error('MD5 tool not found, ensure either md5 or md5sum is in your path');
	process.exit(1);
}

(async () => {
	const rules = await getConfigRules();
	const cache = await getCache();
	const md5Path = await getMd5Path();
	const options = { cache, md5Path, verbose };
	const promises = Promise.all(rules.map(async (rule) => await runner.processRule(rule, options)));

	promises
		.then(() => console.log('Done.'))
		.catch((err) => console.log('Failed:', err));
})();