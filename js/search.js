var exports = {};

exports.IndexIterator = Class.extend({

    __init__: function(token, index, initialPosition) {
        this.token = token;
        this.tokenEnd = token + "~";
        this.index = index;
        this.initialPosition = initialPosition;
        this.position = initialPosition;
    },

    first: function() {
        return this.index[this.initialPosition];
    },

    next: function() {
        this.iteratorIndex++;
        // Break if past index length or token no longer prefix of current index pointer.
        if ((this.position >= this.index.length) ||
            (this.index[this.position] > this.tokenEnd)) {
            return null;
        } else {
            return this.index[this.position];
        }
    },

});

exports.ResultsSet = Class.extend({

});

exports.SortedIndex = Class.extend({

    __init__: function() {

    },

    getTokenIterator: function(token) {

    },

    tokenize: function(string) {
        var words = string.toLowerCase().split(/ /);
        return words.map(function(s) { return s.replace(/\W/g, '') });
    },

    search: function(query) {
        var tokens = this.tokenize(query);
        return searchIntersectionOfTokens(tokens);
    },

    searchIntersectionOfTokens: function(tokens) {
        // TODO: optimize by memoizing results.
        var documentCount = {};
        this.searchToken(token);
    },

    searchToken: function(token) {
        var indexIterator = this.getTokenIterator(token);
        var results = new ResultsSet();
        for (
            var postingsList = indexIterator.first();
                postingsList = indexIterator.next();
                postingsList != null
            ) {
            results.add(postingsList.documents);
        }
        return results;
    },

});