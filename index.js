const path = require('path');
const program = require('commander');
const converter = require('./lib/index');

program
  .version('1.0.0')
  .option('-o, --output', 'output path (default "./generated/")')
  .option('-a, --all  [optional]', 'generate font from all icon in icon folder ')
  .option('-i, --input [optional]', 'svg icon source path (default "./icons/")')
  .option('-f, --font [optional]', 'font config file (default "./font.json")')
  .parse(process.argv);

if (program.all) {
  converter.generateAll();
} else {
  converter.generate({
    fontConfig: require(program.font || path.join(__dirname, 'font.json')),
    outputPath: path.join('..', program.output || 'generated'),
    glyphsPath: program.input || 'icons',
    fontSpecimen: true
  });
}
