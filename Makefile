documents.db:
	echo "Creating document database..."
	echo "CREATE TABLE documents (document_title VARCHAR(255), document_text TEXT, document_info_json TEXT, PRIMARY KEY (document_title));" | sqlite3 documents.db

js/raw_index.js: documents.db
	python scripts/fryindex.py documents.db > js/raw_index.js

all: documents.db js/raw_index.js
