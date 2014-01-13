var mongoose = require('mongoose');
var config = require('../config');

mongoose.connect(config.get('mongoose:uri'), config.get('mongoose:options'));
console.log('Connecting to ' + config.get('mongoose:uri'));

module.exports = mongoose;