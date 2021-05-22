const fs = require('fs')
const runner = require('./runner')

const raw = fs.readFileSync('.pyper.json');
const rules = JSON.parse(raw);

const promises = Promise.all(rules.map(runner.processRule));

promises
	.then(() => console.log('Done.'))
	.catch((err) => console.log('Failed', err));
