$(document).ready(function() {

    var index = new FrySearch.SortedIndex(RAW_INDEX.sortedIndex, RAW_INDEX.forwardIndex, RAW_INDEX.titleToId);
    installSearchBarHandlers(index);
    $('#searchbar').focus();
    $('#video-box-container').click(function(e) {
        hideVideo();
    });
    loadVideoFromUrl(index);
});

function loadVideoFromUrl(index) {
    if (window.location.hash != "") {
        var title = window.location.hash.slice(1);
        showVideo(index.getUrlFromTitle(title));
    }
}

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

function installSearchBarHandlers(index) {
    var timer = null;
    var last = null;
    function update(target) {
        var searchQuery = target.value;
        if (searchQuery != last) {
            last = searchQuery;
            var tokens = index.tokenize(searchQuery);       
            var searchResults = index.search(searchQuery);
            updateSearchResults(searchResults, tokens);
        }
    }
    $('#searchbar').focus(function(e) {
        timer = setInterval(function() { update(e.target) }, 200)
    });
    $('#searchbar').blur(function(e) {
        clearInterval(timer);
    });
}

function createDocumentPreviewElement(documentInfo, tokens) {
    var title = documentInfo.title;
    var url = documentInfo.url;
    var preview = documentInfo.preview;
    var quote = documentInfo.document;

    var $newElement = $('<div class="video-preview"></div>');
    var $newLink = $('<a></a>').attr('href', '#' + title);
    var $newImage = $('<img></img>').attr('src', preview);
    var $newQuote = $('<p class="quote"></p>');

    if (tokens !== undefined) {
        tokens.forEach(function(token) {
            quote = quote.replace(new RegExp('\\b(' + token + ')', 'ig'), '<span class="highlight">$1</span>');
        });
    }

    $newQuote.html(quote);
    $newLink.append($newImage);
    $newLink.append($newQuote);
    $newElement.append($newLink);
    $newElement.click(function() {
        showVideo(url);
    });

    return $newElement;
}

function showVideo(url) {
    var $newVideo = $('<video>' +
                      'Your browser does not support the <code>video</code>element.' +
                      '</video>');
    $newVideo.attr('src', url);

    $('#video-box').empty();
    $('#video-box').append($newVideo);
    $('#video-box-container').show();
    $('#video-box').show();
    installVideoHandlers();    
    playVideo();
}

function hideVideo() {
    $('#video-box video')[0].pause();
    $('#video-box-container').hide();
    $('#video-box').hide();
    window.location.hash = "";
}

function playVideo() {
    $('#video-box video')[0].play();
}

function updateSearchResults(results, tokens) {
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
            var newElement = createDocumentPreviewElement(result, tokens);
            $columnElement.append(newElement);
        }
    });
}