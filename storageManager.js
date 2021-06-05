function store(selection, container, url, color, callback) {
    chrome.storage.local.get({highlights: {}}, (result) => {
        var highlights = result.highlights;

        if (!highlights[url])
            highlights[url] = [];

        highlights[url].push({
            string: selection.toString(),
            container: getQuery(container),
            anchorNode: getQuery(selection.anchorNode),
            anchorOffset: selection.anchorOffset,
            focusNode: getQuery(selection.focusNode),
            focusOffset: selection.focusOffset,
            color: color
        });
        chrome.storage.local.set({highlights});

        if (callback)
            callback();
    });
}

function loadAll(url) {
    chrome.storage.local.get({highlights: {}}, function (result) {
        var highlights = result.highlights[url];
        chrome.runtime.sendMessage({badge: "0"});
        if (highlights) {
            if (highlights.length > 0) {
                chrome.runtime.sendMessage({badge: highlights.length});
            }
        }
        for (var i = 0; highlights && i < highlights.length; i++) {
            load(highlights[i]);
        }
    });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if (request.type === 'upd') {
        updateHighlights();
      }
  });

function updateHighlights() {
    chrome.storage.local.get({highlights: {}}, function (result) {
        var highlights = result.highlights[window.location.pathname];
        chrome.runtime.sendMessage({badge: "0"});
        if (highlights) {
            if (highlights.length > 0) {
                chrome.runtime.sendMessage({badge: highlights.length});
            }
        }
    });
}

function load(highlightVal, noErrorTracking) {
    var selection = {
        anchorNode: elementFromQuery(highlightVal.anchorNode),
        anchorOffset: highlightVal.anchorOffset,
        focusNode: elementFromQuery(highlightVal.focusNode),
        focusOffset: highlightVal.focusOffset
    };

    var selectionString = highlightVal.string;
    var container = elementFromQuery(highlightVal.container);
    var color = highlightVal.color;

    if (!selection.anchorNode || !selection.focusNode || !container) {
        if (!noErrorTracking) {
            addHighlightError(highlightVal);
        }
        return false;
    } else {
        var success = highlight(selectionString, container, selection, color);
        if (!noErrorTracking && !success) {
            addHighlightError(highlightVal);
        }
        return success;
    }
}

function clearPage(url) {
    chrome.storage.local.get({highlights: {}}, (result) => {
        var highlights = result.highlights;
        delete highlights[url];
        chrome.storage.local.set({highlights});
    });
}

function elementFromQuery(storedQuery) {
    var re = />textNode:nth-of-type\(([0-9]+)\)$/i;
    var result = re.exec(storedQuery);

    if (result) {
        var textNodeIndex = parseInt(result[1]);
        storedQuery = storedQuery.replace(re, "");
        var parent = $(storedQuery)[0];
        if (!parent)
            return undefined;
        return parent.childNodes[textNodeIndex];
    }
    else
        return $(storedQuery)[0];
}
function getQuery(element) {
    if (element.id)
        return '#' + escapeCSSString(element.id);
    if (element.localName === 'html')
        return 'html';

    var parent = element.parentNode;

    var index;
    var parentSelector = getQuery(parent);
    if (!element.localName) {
        index = Array.prototype.indexOf.call(parent.childNodes, element);

        return parentSelector + '>textNode:nth-of-type(' + index + ')';
    }
    else {
        var jEl = $(element);
        index = jEl.index(parentSelector + '>' + element.localName) + 1;
        return parentSelector + '>' + element.localName + ':nth-of-type(' + index + ')';
    }
}

function escapeCSSString(cssString) {
    return cssString.replace(/(:)/g, "\\$1");
}
