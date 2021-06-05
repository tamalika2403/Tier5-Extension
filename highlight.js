updateHighlights();
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == "getCursor") {
        if (window.showHighlighterCursor) {
            sendResponse({getCursor: 1});
        } else {
            sendResponse({getCursor: 0});
        }
    }
});

var DELIMITERS = {
    start: '~|:;',
    end: ';:~|'
};

var blackColor = ['F5FA57', 'FFA7B6', 'FF9D99', 'C2DBFF', 'C2FFDA', 'D1DEE1', 'FFD417', 'FE2868', 'FF4343', '1ACEEB', '1AF572', '7C9EA6'];
var HIGHLIGHT_CLASS = 'highlighter--highlighted';
function getReplacements(color) {
    var textColor = "#FFFFFF";
    if (blackColor.includes(color)) {
        textColor = "#222222";
    }
    return {
        start: '<span class="' + HIGHLIGHT_CLASS + '" style="background-color: ' + "#" + color + '; color: ' + textColor + ';">',
        end: '</span>'
    };
}

var anchor = null, focus = null;
var anchorOffset = 0, focusOffset = 0;
var selectionString = "";
var selectionLength = 0;
var startFound = false;
var charsHighlighted = 0;
var alreadyHighlighted = true;
function resetVars() {
    anchor = null;
    focus = null;
    anchorOffset = 0;
    focusOffset = 0;
    selectionString = "";
    selectionLength = 0;
    startFound = false;
    charsHighlighted = 0;
    alreadyHighlighted = true;
}
function highlight(selString, container, selection, color) {
    resetVars();
    selectionString = selString;
    selectionLength = selectionString.length;
    container = $(container);
    anchor = $(selection.anchorNode);
    anchorOffset = selection.anchorOffset;
    focus = $(selection.focusNode);
    focusOffset = selection.focusOffset;
    recursiveWrapper(container);
    color = color ? color : "e06666";
    var replacements = getReplacements(color);
    var parent = container.parent();
    var content = parent.html();
    var startRe, endRe, sanitizeRe;
    if (!alreadyHighlighted) {
        startRe = new RegExp(escapeRegex(DELIMITERS.start), "g");
        endRe = new RegExp(escapeRegex(DELIMITERS.end), "g");
        content = content.replace(startRe, replacements.start).replace(endRe, replacements.end);
        sanitizeRe = new RegExp(escapeRegex(replacements.start + replacements.start) + '(.*?)' + escapeRegex(replacements.end + replacements.end), "g");
        parent.html(content.replace(sanitizeRe, replacements.start + "$1" + replacements.end));
    }
    else {
        startRe = new RegExp(escapeRegex(DELIMITERS.start), "g");
        endRe = new RegExp(escapeRegex(DELIMITERS.end), "g");
        content = content.replace(startRe, replacements.end).replace(endRe, replacements.start);
        sanitizeRe = new RegExp(escapeRegex(replacements.start + replacements.end), "g");
        parent.html(content.replace(sanitizeRe, ''));
    }
    if (selection.removeAllRanges)
        selection.removeAllRanges();
    return true;
}
function recursiveWrapper(container) {
    container.contents().each(function (index, element) {
        if (element.nodeType === Node.TEXT_NODE) {
            var startIndex = 0;
            if (!startFound) {
                if (anchor.is(element)) {
                    startFound = true;
                    startIndex = anchorOffset;
                }
                if (focus.is(element)) {
                    if (startFound)
                        startIndex = Math.min(anchorOffset, focusOffset);
                    else {
                        startFound = true;
                        startIndex = focusOffset;
                    }
                }
            }
            if (startFound && charsHighlighted < selectionLength) {
                var nodeValueLength = element.nodeValue.length;
                var newText = "";

                var parent = element.parentElement;
                if (parent.nodeName !== 'SPAN' || parent.className !== HIGHLIGHT_CLASS)
                    alreadyHighlighted = false;
                for (var i = 0; i < nodeValueLength; i++) {
                    if (i === startIndex)
                        newText += DELIMITERS.start;
                    if (charsHighlighted === selectionLength) {
                        newText += DELIMITERS.end;
                        newText += element.nodeValue.substr(i);
                        break;
                    }
                    newText += element.nodeValue[i];
                    if (i >= startIndex && charsHighlighted < selectionLength) {
                        while (charsHighlighted < selectionLength && selectionString[charsHighlighted].match(/\s/))
                            charsHighlighted++;

                        if (selectionString[charsHighlighted] === element.nodeValue[i])
                            charsHighlighted++;
                    }
                    if (i === nodeValueLength - 1)
                        newText += DELIMITERS.end;
                }
                element.nodeValue = newText;
            }
        }
        else
            recursiveWrapper($(element))
    });
}