'use strict';
const path = require('path');
const program = require('commander');
const converter = require('./lib/index');
const fs = require('fs');

program
	.version('1.0.0')
	.option('-o, --output', 'output path (default "./generated/")')
	.option('-a, --all  [optional]', 'generate font from all icon in icon folder ')
	.option('-i, --input [optional]', 'svg icon source path (default "./icons/")')
	.option('-f, --font [optional]', 'font config file (default "./font.json")')
	.option('-l, --list [optional]', 'generates SCSS map - name: unicode')
	.option('-s, --specimen [optional]', 'generate specimen')
	.parse(process.argv);

program.input = path.join('.', program.input || 'icons');

let outputPath = path.join('.', program.output || 'generated');
let glyphsPath = path.join('.', program.input || 'icons');
let fontPath = program.font || path.join(__dirname, 'font.json');

try {
	let fontConfig;
	if (program.all) {
		fontConfig = converter.fetchConfig(glyphsPath);
	} else {
		fontConfig = JSON.parse(fs.readFileSync(fontPath, 'utf8'));
	}
	converter.generate({
		fontConfig: fontConfig,
		outputPath: outputPath,
		glyphsPath: program.input || 'icons',
		fontSpecimen: !!program.specimen
	});
	if (program.list) {
		converter.generateList({
			fontConfig: fontConfig,
			outputPath: outputPath
		});
	}
} catch (e) {
	if (e.code === 'ENOENT') {
		console.error(`Unable to find font JSON file "${fontPath}" `);
	} else {
		console.error(e);
	}
}
