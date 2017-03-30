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
	.option('-s, --specimen [optional]', 'generate specimen')
	.parse(process.argv);

program.input = path.join('.', program.input || 'icons');

let outputPath = path.join('.', program.output || 'generated');
try {
	fs.mkdirSync(outputPath);
} catch (e) {}


if (program.all) {
	converter.generateAll({
		outputPath: outputPath,
		glyphsPath: program.input || 'icons',
		fontSpecimen: true
	});
} else {
	let fontPath = program.font || path.join(__dirname, 'font.json');
	try {
		let fontFile = fs.readFileSync(fontPath, 'utf8');
		let fontConfig = JSON.parse(fontFile);

		converter.generate({
			fontConfig: fontConfig,
			outputPath: outputPath,
			glyphsPath: program.input || 'icons',
			fontSpecimen: !!program.specimen
		});
	} catch (e) {
		if (e.code === 'ENOENT') {
			console.error(`Unable to find font file "${fontPath}" `);
		} else {
			console.error(e);
		}
	}
}
