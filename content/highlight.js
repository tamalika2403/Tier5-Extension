"use strict";
var selection = window.getSelection();
var selectionString = selection.toString();
if (selectionString) {
    var container = selection.getRangeAt(0).commonAncestorContainer;
    while (!container.innerHTML) {
        container = container.parentNode;
    }
    chrome.storage.sync.get('color', (values) => {
        var color = values.color;
        store(selection, container, window.location.pathname, color, () => {
            highlight(selectionString, container, selection, color);
            updateHighlights();
        });
    });
}
