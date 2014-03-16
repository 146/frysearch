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

	var $newElement = $('<div class="video-preview"></div>');
	var $newLink = $('<a></a>').attr('href', url);
	var $newImage = $('<img></img>').attr('src', url + '.jpg');
	var $newQuote = $('<p class="quote"></p>');

	$newQuote.text(quote);
	$newLink.append($newImage);
	$newLink.append($newQuote);
	$newElement.append($newLink);
	return $newElement;
}

function updateSearchResults(results) {
	var columns = [
		$('#results-col-1'),
		$('#results-col-2'),
		$('#results-col-3')		
	];
	var indexToCol = {};
	columns.forEach(function(col, i) {
		col.empty();
		indexToCol[i] = col;
	});
	results.forEach(function(result, i) {
		if (result !== undefined) {
			var $columnElement = indexToCol[i % 3];
			var newElement = createDocumentPreviewElement(result);
			$columnElement.append(newElement);
		}
	});
}