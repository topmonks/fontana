# Fontana
Tool for building custom icon font.
Generates fonts ttf, woff, woff2 and eot from svg icons.
Specimen is generated as html page - for correct work needs some http server (e.g. https://www.npmjs.com/package/http-server).

There is also integration with EmberJS, see https://github.com/topmonks/ember-cli-fontana.

# Run
```
node index.js
```


```
Options:
	-o, --output', 'output path (default "./generated/")
	-a, --all  [optional]', 'generate font from all icon in icon folder
	-i, --input [optional]', 'svg icon source path (default "./icons/")
	-f, --font [optional]', 'font config file (default "./font.json")
	-s, --specimen [optional]', 'generate specimen
```

Font config file
```
{
  "name": "My cool font",
  "glyphs": [
    {
      "unicode": [
        "\uF1E6"
      ],
      "name": "some icon1",
      "file": "someicon1"
    },
    {
      "unicode": [
        "\uf067"
      ],
	  "name": "some icon2",
	  "file": "someicon2"
    }
}
```
