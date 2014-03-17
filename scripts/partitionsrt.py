#!/usr/bin/python

import sys
import re

BLOCK_GAP = 1.0
BLOCK_MARGIN = 0.5

def timestamp_to_seconds(timestamp):
	hours, minutes, seconds = timestamp.strip().split(':')
	return 3600 * int(hours) + 60 * int(minutes) + float(seconds)

def seconds_to_timestamp(seconds):
	hours = int(seconds / 3600)
	minutes = int(seconds / 60)
	seconds = seconds % 60
	return '{hours}:{minutes}:{seconds}'.format(
		hours=hours,
		minutes=minutes,
		seconds=seconds)

class SRTUnit(object):
	def __init__(self, unit_id, timestamp_begin, timestamp_end, text):
		self.unit_id = unit_id
		self.timestamp_begin = timestamp_begin
		self.timestamp_end = timestamp_end
		self.text = text
		self.text = re.sub(r'II', r'll', self.text)
		self.text = re.sub(r'([A-Za-z])I', r'\1l', self.text)
		self.text = re.sub(r' I([a-z])', r' l\1', self.text)
		self.text = ' '.join(self.text.splitlines())

	def __str__(self):
		return "{begin} - {end}: {text}".format(
			begin=self.timestamp_begin,
			end=self.timestamp_end,
			text=self.text)

	def __repr__(self):
		return str(self)

class SRTBlock(object):
	def __init__(self):
		self.timestamp_begin = None
		self.timestamp_end = None
		self.text_lines = []

	def text(self):
		return '\n'.join(self.text_lines)

	def add(self, unit):
		if self.timestamp_begin is None:
			self.timestamp_begin = unit.timestamp_begin
		self.timestamp_end = unit.timestamp_end
		new_text = re.sub(r'\(.*\)', '', unit.text).strip()
		if new_text:
			self.text_lines.append(new_text)

	def should_add(self, unit):
		if self.timestamp_end is None and self.timestamp_begin is None:
			return True
		else:
			end = timestamp_to_seconds(self.timestamp_end)
			new_begin = timestamp_to_seconds(unit.timestamp_begin)
			return new_begin - end < BLOCK_GAP

	def title(self):
		t = self.text().lower()
		t = re.sub(r'[^a-z \n]', '', t)
		return '-'.join(t.split()[:6])

	def __str__(self):
		return "{begin} - {end}: {text}".format(
			begin=self.timestamp_begin,
			end=self.timestamp_end,
			text=self.text())

	def __repr__(self):
		return str(self)

def splitsrt(fname):
	raw = open(fname).read()
	units = raw.strip().split('\n\n')
	ret = []
	for unit in units:
		try:
			lines = unit.splitlines()
			unit_id = lines[0]
			timestamp_begin, timestamp_end = lines[1].replace(',', '.').split(' --> ')
			text = '\n'.join(lines[2:])
			ret.append(SRTUnit(unit_id, timestamp_begin, timestamp_end, text))
		except:
			print >> sys.stderr, "Problem handling unit:"
			print >> sys.stderr, unit
	return ret

def combinesrt(units):
	ret = []
	current_block = SRTBlock()
	for unit in units:
		if not current_block.should_add(unit):
			ret.append(current_block)
			current_block = SRTBlock()
		current_block.add(unit)
	ret.append(current_block)
	ret = [block for block in ret if block.text()]
	return ret

if __name__ == '__main__':
	command = sys.argv[1]
	assert command in ('--info', '--process', '--index'), "Invalid command."
	
	fname = sys.argv[2]
	videofile = sys.argv[3]
	units = splitsrt(fname)
	blocks = combinesrt(units)
	totalwords = 0
	for block in blocks:
		if command == '--info':
			print block.title()
			print block
			print
		start = timestamp_to_seconds(block.timestamp_begin) - BLOCK_MARGIN
		diff = timestamp_to_seconds(block.timestamp_end) - timestamp_to_seconds(block.timestamp_begin) + BLOCK_MARGIN * 2
		if command == '--process':
			print "ffmpeg -y -i {fname} -ss {start} -t {diff} -vcodec libx264 -acodec libmp3lame {title}.mkv".format(
				fname=videofile,
				start=seconds_to_timestamp(start),
				diff=diff,
				title=block.title()
				)
		if command == '--index':
			print '('
			print '    "videos/{title}.mkv",'.format(title=block.title())
			print '"""'
			print block.text()
			print '"""'
			print '),'
		totalwords += len(block.text().split())
	average = float(totalwords) / len(blocks)
	if command == '--info':
		print 'Number of blocks: %d' % len(blocks)
		print 'Average block length: %d words' % average