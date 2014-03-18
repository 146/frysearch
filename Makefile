quotes.db:
	echo "Creating quotes database..."
	echo "CREATE TABLE quotes (title VARCHAR(255), video_url VARCHAR(255), preview_url VARCHAR(255), quote TEXT, PRIMARY KEY (title));" | sqlite3 quotes.db

js/raw_index.js: quotes.db
	python scripts/buildindex.py quotes.db > js/raw_index.js

all: quotes.db js/raw_index.js
