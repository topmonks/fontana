'use strict';

const fs = require('fs');
const path = require('path');
const svgicons2svgfont = require('svgicons2svgfont');
const svg2ttf = require('svg2ttf');
const ejs = require('ejs');
const MemoryStream = require('memory-stream');
const converters = {
	woff: require('ttf2woff'),
	woff2: require('ttf2woff2'),
	eot: require('ttf2eot')
};

function runConverters(svgFont, output) {
	let ttf = svg2ttf(svgFont, {});

	fs.writeFileSync(output + '.ttf', new Buffer(ttf.buffer));
	console.log(`- ${output}.ttf`);

	Object.keys(converters).forEach((key) => {
		fs.writeFileSync(`${output}.${key}`, converters[key](ttf.buffer));
		console.log(`- ${output}.${key}`);
	});
}

function decode(char) {
	let buf = [];

	char = new String(char);
	for (let i = 0; i < char.length; i++) {
		buf[i] = char.charCodeAt(i).toString(16);
	}
	return buf.join('');
}

function generateSpecimen(font, output) {
	font.decode = decode;
	ejs.renderFile('tpl.ejs', font, {}, function(err, str) {
		if (err) {
			console.log(err);
		} else {
			fs.writeFileSync(output + '-specimen' + '.html', str);
		}
	});
}

function convert(fontConfig, glyphsPath) {
	return new Promise((resolve, reject) => {
		let ms = new MemoryStream();
		let fontStream = svgicons2svgfont({
			fontName: fontConfig.name,
			normalize: true
		});

		fontStream.pipe(ms).on('finish', () => {
			resolve(ms.toString());
		}).on('error', function(err) {
			console.log(err);
		});
		console.log(`${fontConfig.name}: ${fontConfig.glyphs.length} glyphs found`);
		fontConfig.glyphs.forEach((glyphData) => {
			const glyphPath = `${glyphsPath}/${glyphData.file}.svg`;

			if (fs.existsSync(glyphPath)) {
				const glyph = fs.createReadStream(glyphPath);

				glyph.metadata = glyphData;
				fontStream.write(glyph);
			} else {
				console.warn(`${glyphPath} not found!`);
			}
		});
		fontStream.end();
	});
}

function fetchConfig(iconFolder) {
	let config = {name: 'All',glyphs: []};
	let files = fs.readdirSync(iconFolder);

	files.forEach((file, index) => {
		config.glyphs.push({
			'unicode': [
				String.fromCharCode(index)
			],
			'name': file,
			'file': file.replace(/\.svg/, '')
		});
	});
	return config;

}

exports.generate = function(param) {
	let fontConfig = param.fontConfig;
	let outputPath = param.outputPath;
	let glyphsPath = param.glyphsPath;

	fontConfig.name = fontConfig.name || 'font';
	convert(fontConfig, glyphsPath).then((svgFont) => {
		let outputDir = path.join(__dirname, outputPath);
		let output = path.join(outputDir, fontConfig.name);

		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir);
		}

		runConverters(svgFont, output);
		if (param.fontSpecimen) {
			generateSpecimen(fontConfig, output);
		}
		console.log(`Font "${fontConfig.name}" created!`);
	});
};

exports.generateAll = function(param) {
	let outputPath = param.outputPath;

	convert(fetchConfig(param.glyphsPath), './icons').then((svgFont) => {
		let output = `${outputPath}/${fontConfig.name}`;

		if (!fs.existsSync(outputPath)) {
			fs.mkdirSync(outputPath);
		}
		runConverters(svgFont, output);
		generateSpecimen(fontConfig, output);
		console.log(`Font "${fontConfig.name}" created!`);
	});
};
