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
	fs.writeFileSync(output + '.svg', new Buffer(svgFont));
	if (fs.existsSync(output + '.svg')) {
		console.log(`- ${output}.svg created.`);
	}

	let ttf = svg2ttf(svgFont, {});

	fs.writeFileSync(output + '.ttf', new Buffer(ttf.buffer));
	if (fs.existsSync(output + '.ttf')) {
		console.log(`- ${output}.ttf created.`);
	}

	Object.keys(converters).forEach((key) => {
		let path = `${output}.${key}`;

		fs.writeFileSync(path, converters[key](ttf.buffer));
		if (fs.existsSync(path)) {
			console.log(`- ${output}.${key} created.`);
		} else {
			console.error(`- ${output}.${key} wasn't created!`);
		}
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
		console.log(`${fontConfig.name}: ${fontConfig.glyphs.length} glyphs found in font config.`);
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

exports.fetchConfig = function(iconFolder) {
	let config = {name: 'all',glyphs: []};
	let files = fs.readdirSync(iconFolder);

	files.forEach((file, index) => {
		config.glyphs.push({
			'unicode': [
				String.fromCharCode(index + 0xf000)
			],
			'name': file,
			'file': file.replace(/\.svg/, '')
		});
	});
	return config;

};

exports.generate = function(param) {
	let fontConfig = param.fontConfig;
	let outputPath = param.outputPath;
	let glyphsPath = param.glyphsPath;

	fontConfig.name = fontConfig.name || 'font';
	convert(fontConfig, glyphsPath).then((svgFont) => {
		let output = path.join(outputPath, fontConfig.name);
		if (!fs.existsSync(outputPath)) {
			fs.mkdirSync(outputPath);
		}
		runConverters(svgFont, output, outputPath);
		if (param.fontSpecimen) {
			generateSpecimen(fontConfig, output);
		}
	});
};

exports.generateList = function(param) {
	let fontConfig = param.fontConfig;
	let outputPath = param.outputPath;
	let output = path.join(outputPath, fontConfig.name);
	let variablesList = fontConfig.glyphs.map(item => {
		return '\t' + item.name + ': "\\' + decode(item.unicode) + '"';
	});
	let scss = `$${fontConfig.name.toLowerCase()}: (
${variablesList.join(',\n')}
);`;

	fs.writeFileSync(output + '.scss', scss);
};
