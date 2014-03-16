$(document).ready(function() {

	installVideoHandlers();
	installSearchBarHandlers();

});

function installVideoHandlers() {
	$('video').load(function(e) {
		e.play(); e.target.isPlaying = true;
	});

	$('video').click(function(e) {
		var videoElement = e.target;
		if (videoElement.isPlaying) {
			videoElement.pause();
		} else {
			videoElement.play();
		}
	});
	$('video').bind('play playing', function(e) {
		e.target.isPlaying = true;
	});
	$('video').bind('pause ended', function(e) {
		e.target.isPlaying = false;
	});
}

function installSearchBarHandlers() {
	var index = new FrySearch.SortedIndex(RAW_INDEX.sortedIndex, RAW_INDEX.forwardIndex);
	$('#searchbar').keyup(function (e) {
		var searchQuery = e.target.value;
		var searchResults = index.search(searchQuery);
		updateSearchResults(searchResults);
	});
}

function createDocumentPreviewElement(documentInfo) {
	var url = documentInfo.url;
	var quote = documentInfo.document;
	// TODO: Remove unsafe code.
	var htmlStr = '<div class="video-preview"><a href="' + url + '"><img src="' + url + '.jpg"/><p class="quote">' + quote + '</p></a></div>'
	return htmlStr;
}

function updateSearchResults(results) {
	$('#results-col-1').empty();
	$('#results-col-2').empty();
	$('#results-col-3').empty();

	var indexToCol = {
		0: $('#results-col-1'),
		1: $('#results-col-2'),
		2: $('#results-col-3')
	}
	console.log(results);
	results.forEach(function(result, i) {
		console.log(result);
		if (result !== undefined) {
			var $columnElement = indexToCol[i % 3];
			var newElement = createDocumentPreviewElement(result);
			$columnElement.append(newElement);
		}
	});
}