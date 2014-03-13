var rawIndex = require('./raw_index.js').rawIndex;
var search = require('./search.js');

exports.index = new search.SortedIndex(rawIndex);

console.log(exports.index.search('hungry'));
console.log(exports.index.search('a hungry'));