#!/usr/bin/python

import sys
import string
import json
import sqlite3

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
		self.forward_index = {}
		self.postings_list = {}
		self.document_id = 0

	def get_document_id(self):
		self.document_id += 1
		return self.document_id

	def add_document(self, document, info):
		document_id = self.get_document_id()
		tokens = _tokenize(document)
		for token in tokens:
			self.postings_list.setdefault(token, []).append(document_id)
		self.forward_index[document_id] = {
			'document': document
			}
		self.forward_index[document_id].update(info)

	def to_json(self):
		sorted_index = [
			{ "token": token, "postings": list(set(postings)) }
			for token, postings in self.postings_list.items()
		]
		sorted_index.sort(key=lambda e: e['token'])
		full_index = {
			'sortedIndex': sorted_index,
			'forwardIndex': self.forward_index,
		}
		return json.dumps(full_index)

if __name__ == '__main__':
	index = SearchIndex()
	dbname = sys.argv[1]
	dbconn = sqlite3.connect(dbname)
	cursor = dbconn.cursor()

	cursor.execute('SELECT * FROM documents')
	while True:
		row = cursor.fetchone()
		if row:
			title, text, document_info_json = row
			document_info = json.loads(document_info_json)
			index.add_document(text, document_info)
		else:
			break
	print "this.RAW_INDEX = " + index.to_json() + ";"