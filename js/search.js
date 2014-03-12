Object.prototype.fnbind = function(oldFunction) {
    var self = this;
    return function() {
        return self.apply(oldFunction, arguments);
    }
}

function ClassCreate(properties) {
    var newClass = function() {
        if (properties.__init__ !== undefined) {
            properties.__init__.apply(this, arguments);
        }
    }
    for (var propertyName in properties) {
        var property = properties[propertyName];
        newClass.prototype[propertyName] = property;
    }
    return newClass;
}

exports.TestClass = ClassCreate({

    __init__: function (variable) {
        this.variable = variable;
    },

    toString: function() {
        return "I am " + this.variable;
    }

});

exports.IndexIterator = ClassCreate({

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

exports.ResultsSet = ClassCreate({

    __init__: function() {
        this.results = {};
    },

    add: function(posting) {
        // TODO: Modify for TFIDF
        this.results[posting] = 1;
    },

    toArray: function() {
        // TODO: Be able to extend ResultsSets with other ResultsSets.
        var postings = [];
        for (var posting in this.results) {
            postings.push(posting);
        }
        return postings;
    }

});

smallestIndexGreaterThan = function(arr, value, minIndex, maxIndex) {
    // arr[minIndex] should always be less than value or 0
    // arr[maxIndex] should always be greater than value
    // minIndex should always be less than or equal to maxIndex
    if (minIndex >= maxIndex - 1) {
        return maxIndex;
    }
    else if (arr[minIndex] > value) {
        return minIndex;
    }
    else if (arr[maxIndex] < value) {
        return undefined;
    }
    var checkIndex = (minIndex + maxIndex) / 2;
    var checkValue = arr[checkIndex];
    if (checkValue == value) {
        return checkIndex;
    }
    else if (checkValue > value) {
        return smallestIndexGreaterThan(arr, value, minIndex, checkIndex);
    }
    else if (checkValue < value) {
        return smallestIndexGreaterThan(arr, value, checkIndex, maxIndex);
    }
}

exports.SortedIndex = ClassCreate({

    __init__: function(index) {
        this.index = index;
    },

    getTokenIterator: function(token) {
        var iteratorStart = smallestIndexGreaterThan(this.index, token, 0, this.index.length);
        if (iteratorStart === undefined) {
            return undefined;
        }
        return new exports.IndexIterator(token, this.index, iteratorStart);
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
        // TODO: optimize by memoizing intermediate results.
        var postingCount = {};
        tokens.forEach(this.fnbind(function(token) {
            var postings = this.searchToken(token);
            postings.forEach(function(posting) {
                if (postingCount[posting] === undefined) {
                    postingCount[posting] = 1;
                } else {
                    postingCount[posting]++;
                }
            })
        }));
        var postingCountItems = [];
        for (var posting in postingCount) {
            postingCountItems.push([-postingCount[posting], posting]);
        }
        postingCountItems.sort()
        return postingCountItems;
    },

    searchToken: function(token) {
        // TODO: optimize by memoizing intermediate results.
        var indexIterator = this.getTokenIterator(token);
        var results = new ResultsSet();
        if (indexIterator === undefined) {
            return results.toArray();
        }
        for (
            var postingsList = indexIterator.first();
                postingsList = indexIterator.next();
                postingsList != null
            ) {
            results.add(postingsList.documents);
        }
        return results.toArray();
    },

});