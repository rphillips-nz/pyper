#!/usr/bin/env node

const fs = require('fs').promises;
const runner = require('./runner')
const { lookpath } = require('lookpath');


(async () => {
	let rules = {};
	try {
		const raw = await fs.readFile('.pyper.json');
		rules = JSON.parse(raw);
		console.log('Config found.');
	} catch {
		console.log('No config found.');
		process.exit(1);
	}

	let cache = {};
	try {
		const raw = await fs.readFile('.pyper/cache.json');
		cache = JSON.parse(raw);
		console.log('Cache found.');
	} catch {
		cache = {};
		console.log('No cache found.');
	}

	const options = { cache };

	options.md5Path = await lookpath('md5');
	if (!options.md5Path) {
		options.md5Path = await lookpath('md5sum');
		if (!options.md5Path) {
			console.error('Neither md5 or md5sum found in path');
			process.exit(1);
		}
	}

	console.log(`Using MD5 tool at ${options.md5Path}`);

	const promises = Promise.all(rules.map((rule) => runner.processRule(rule, options)));

	promises
		.then(() => console.log('Done.'))
		.catch((err) => console.log('Failed', err));
})();