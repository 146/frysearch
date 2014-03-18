(function(exports) {

    Function.prototype.bind = function(self) {
        var oldFunction = this;
        return function() {
            return oldFunction.apply(self, arguments);
        }
    }

    var _DEBUG = false;
    var _log = (function() {
        if (_DEBUG) {
            return console.log;
        } else {
            return function() {};
        }
    })()

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

    ClassCreate((function() { 
        var privateVariable = 10;
        return {
            first : function() { return privateVariable; }
        }
    })());


    exports.IndexIterator = ClassCreate({

        __init__: function(token, index, initialPosition) {
            this.token = token;
            this.tokenEnd = token + "~";
            this.index = index;
            this.initialPosition = initialPosition;
            this.position = initialPosition;
        },

        first: function() {
            if (this.index[this.position].token > this.tokenEnd) {
                return null;
            } else {
                return this.index[this.initialPosition];
            }
        },

        next: function() {
            this.position++;
            // Break if past index length or token no longer prefix of current index pointer.
            if ((this.position >= this.index.length) ||
                (this.index[this.position].token > this.tokenEnd)) {
                return null;
            } else {
                _log("Including token: " + this.index[this.position]);
                return this.index[this.position];
            }
        },

    });

    exports.ResultsSet = ClassCreate({

        __init__: function() {
            this.results = {};
        },

        add: function(postings) {
            // TODO: Modify for TFIDF
            postings.forEach((function(posting) {
                this.results[posting] = 1;
            }).bind(this));
        },

        toArray: function() {
            // TODO: Be able to extend ResultsSets with other ResultsSets.
            var postings = [];
            for (var posting in this.results) {
                if (typeof(this.results[posting]) == "number") {
                    postings.push(posting);
                }
            }
            return postings;
        }

    });

    var smallestIndexGreaterThan = function(arr, value, minIndex, maxIndex) {
        // arr[minIndex] should always be less than value or 0
        // arr[maxIndex] should always be greater than value
        // minIndex should always be less than or equal to maxIndex
        if (minIndex >= maxIndex - 1) {
            return maxIndex;
        }
        else if (arr[minIndex].token > value) {
            return minIndex;
        }
        else if (arr[maxIndex].token < value) {
            return undefined;
        }
        var checkIndex = Math.floor((minIndex + maxIndex) / 2);
        var checkValue = arr[checkIndex].token;
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

        __init__: function(index, forwardIndex) {
            this.index = index;
            this.forwardIndex = forwardIndex;
        },

        getTokenIterator: function(token) {
            var iteratorStart = smallestIndexGreaterThan(this.index, token, 0, this.index.length - 1);
            if (iteratorStart === undefined) {
                return undefined;
            }
            return new exports.IndexIterator(token, this.index, iteratorStart);
        },

        tokenize: function(string) {
            var words = string.toLowerCase().split(/\s+/);
            return (words
                .map(function(s) { return s.replace(/\W/g, '') })
                .filter(function(s) { return !s.match(/^\s*$/) })
                );
        },

        search: function(query) {
            var tokens = this.tokenize(query);
            var results = this.searchIntersectionOfTokens(tokens);
            return results.map((function(searchResult) {
                var score = searchResult[0];
                var documentId = searchResult[1];
                return this.forwardIndex[documentId];
            }).bind(this));
        },

        searchIntersectionOfTokens: function(tokens) {
            // TODO: optimize by memoizing intermediate results.
            var postingCount = {};
            tokens.forEach((function(token) {
                var postings = this.searchToken(token);
                _log("Search", token, "=", postings);
                postings.forEach(function(posting) {
                    if (postingCount[posting] === undefined) {
                        postingCount[posting] = 1;
                    } else {
                        postingCount[posting]++;
                    }
                })
            }).bind(this));
            var postingCountItems = [];
            for (var posting in postingCount) {
                if (typeof(postingCount[posting]) == "number") {
                    _log(posting, postingCount[posting]);
                    postingCountItems.push([postingCount[posting], posting]);
                }
            }
            postingCountItems.sort();
            postingCountItems.reverse();
            return postingCountItems;
        },

        searchToken: function(token) {
            // TODO: optimize by memoizing intermediate results.
            var indexIterator = this.getTokenIterator(token);
            var results = new exports.ResultsSet();
            if (indexIterator === undefined) {
                return results.toArray();
            }
            for (
                var postingsList = indexIterator.first();
                    postingsList != null;
                    postingsList = indexIterator.next()
                ) {
                results.add(postingsList.postings);
            }
            return results.toArray();
        },

    });
})(typeof exports === 'undefined'? this['FrySearch']={}: exports);