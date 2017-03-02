"use strict";

const fs = require('fs');
const svgicons2svgfont = require('svgicons2svgfont');
const svg2ttf = require('svg2ttf');
const font = require('./font.json');
const ttf2woff = require('ttf2woff');
const ttf2woff2 = require('ttf2woff2');
const ttf2eot = require('ttf2eot');
const ejs = require('ejs');
let MemoryStream = require('memory-stream');

let fontStream = svgicons2svgfont({
  fontName: font.name,
  normalize: true
});


var result = 'generated/' + font.name
let ms = new MemoryStream();

fontStream.pipe(ms).on('finish', () => {
  convertToTtf(ms.toString());
  convertToWoff2();
  convertToWoff();
  convertToEof();
  generateSpecimen(font)
  console.log(`Font ${font.name} successfully created!`)

}).on('error', function(err) {
  console.log(err);
});

font.glyphs.forEach((glyphData) => {
  var glyph = fs.createReadStream(`svg-icons/${glyphData.file}.svg`);
  glyph.metadata = {
    unicode: glyphData.unicode,
    name: glyphData.name
  };
  fontStream.write(glyph);
})
fontStream.end();

function convertToTtf(svgFont) {
  let ttf = svg2ttf(svgFont, {});
  fs.writeFileSync(result + '.ttf', new Buffer(ttf.buffer));
}
function convertToWoff2() {
  var input = fs.readFileSync(result + '.ttf');
  fs.writeFileSync(result + '.woff2', ttf2woff2(input))
}
function convertToWoff() {
  var input = fs.readFileSync(result + '.ttf');
  fs.writeFileSync(result + '.woff', ttf2woff(input))
}
function convertToEof() {
  var input = fs.readFileSync(result + '.ttf');
  fs.writeFileSync(result + '.eot', ttf2eot(input))
}
function decode(char) {
  let buf = [];

  char = new String(char);
  for (let i = 0; i < char.length; i++) {
    buf[i] = char.charCodeAt(i).toString(16);
  }
  return buf.join('');
}

function generateSpecimen(font) {
  font.decode = decode;
  ejs.renderFile('tpl.ejs', font, {

  }, function(err, str) {
    if (err) {
      console.log(err)
    }
    fs.writeFileSync(result + '-specimen' + '.html', str)
  });
}
