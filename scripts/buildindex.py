#!/usr/bin/python

import sys
import string
import json

def _tokenize(document):
	document = document.lower()
	tokens = document.split()
	tokens = [
		''.join(ch for ch in token if ch in string.ascii_lowercase)
		for token in tokens
	]
	tokens = [token for token in tokens if token]
	return tokens

class SearchIndex(object):

	def __init__(self):
		self.postings_list = {}

	def add_document(self, document_id, document):
		tokens = _tokenize(document)
		for token in tokens:
			self.postings_list.setdefault(token, []).append(document_id)

	def to_json(self):
		sorted_index = [
			{ "token": token, "postings": postings }
			for token, postings in self.postings_list.items()
		]
		sorted_index.sort(key=lambda e: e['token'])
		return json.dumps(sorted_index)

if __name__ == '__main__':
	raw = open(sys.argv[1]).read()
	index = SearchIndex()
	for i, line in enumerate(raw.splitlines()):
		index.add_document(i, line)
	print "exports.rawIndex = " + index.to_json() + ";"