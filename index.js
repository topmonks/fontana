const program = require('commander');
const converter = require('./lib/index');

program
  .version('1.0.0')
  .option('-o, --output', 'output path (default "./generated/")')
  .option('-i, --input [optional]', 'svg icon source path (default "./icons/")')
  .option('-f, --font [optional]', 'font config file (default "./font.json")')
  .parse(process.argv);

converter.generate({
  fontConfig: require(program.font || './font.json'),
  outputPath: program.output || './generated',
  glyphsPath: program.input || 'icons'
});
