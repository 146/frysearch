#!/usr/bin/python

import os
import flib
import jinja2

def build_index_html(jsfiles, cssfiles, otherfiles=None):
	otherfiles = otherfiles or {}
	template_str = open('index.html.template').read()
	template = jinja2.Template(template_str)
	index_html = template.render(
		jsfiles=jsfiles,
		cssfiles=cssfiles,
		**otherfiles
		)

	store = flib.S3Store('frystatic')
	store.puts('index.html', index_html, content_type='text/html', public=True)
	return store.url('index.html')

def upload_static_files():
	store = flib.S3Store('frystatic')
	jsfiles = [
		'js/jquery-1.11.0.js',
		'js/search.js',
		'js/client.js',
		'js/raw_index.js',
	]
	cssfiles = [
		'css/bootstrap.css',
		'css/layout.css',
	]
	otherfiles = {
		'searchbuttonurl': 'static/search_128x128.png'
	}

	jsurls, cssurls, others = [], [], {}
	for jsfile in jsfiles:
		key = os.path.split(jsfile)[-1]
		store.putfile(key, jsfile, content_type='application/x-javascript', public=True)
		jsurls.append(store.url(key))
	for cssfile in cssfiles:
		key = os.path.split(cssfile)[-1]
		store.putfile(key, cssfile, content_type='text/css', public=True)
		cssurls.append(store.url(key))
	for name, otherfile in otherfiles.items():
		key = os.path.split(otherfile)[-1]
		store.putfile(key, otherfile, public=True)
		others[name] = store.url(key)

	return (jsurls, cssurls, others)

if __name__ == '__main__':
	print "Uploading static files."
	(jsfiles, cssfiles, otherfiles) = upload_static_files()
	print "Constructing and uploading index.html."
	url = build_index_html(jsfiles, cssfiles, otherfiles)
	print "Site published to " + url