var glob = require('glob');
var fs = require('fs');

module.exports = function() {
  var imports = [
    '@TestOn("browser")',
    'import "package:guinness2/guinness2.dart";'];
  var executes = [];

  var matches = glob.sync('**/*_spec.dart', {cwd: 'dist/dart/angular2'});

  matches.forEach(function(match) {
    var varName = match.replace(/[\/.]/g, '_');
    imports.push('import "' + match + '" as ' + varName +';');
    executes.push('  ' + varName + '.main();');
  });

  var output = imports.join('\n') + '\n\nmain() {\n' + executes.join('\n') + '\n}';

  fs.writeFileSync('dist/dart/angular2/main_test.dart', output);
};
