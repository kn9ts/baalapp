var path = require('path'),
  ucFirst = require('../services/ucfirst');

// load controllers
var controllers = [
  'app',
  'actions',
];

// add them to be exported in one go
controllers.forEach(function(ctrl) {
  module.exports[ucFirst(ctrl)] = require(path.join(__dirname, ctrl));
});
