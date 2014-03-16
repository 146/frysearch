var RAW_INDEX = require('./raw_index.js').RAW_INDEX;
var search = require('./search.js');

exports.index = new search.SortedIndex(RAW_INDEX.sortedIndex, RAW_INDEX.forwardIndex);

console.log(exports.index.search('blackjack'));
console.log(exports.index.search('go blackjack'));
console.log(exports.index.search('blackja'));
console.log(exports.index.search('old'));
console.log(exports.index.search('old fash'));
console.log(exports.index.search('i we'));