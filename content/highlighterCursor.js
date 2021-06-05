"use strict";
window.showHighlighterCursor = false;
function highlightOnSelection() {
    if (!window.showHighlighterCursor) return;
    var selection = window.getSelection();
    var selectionString = selection.toString();
    if (selectionString) {
        chrome.runtime.sendMessage({ action: 'highlight' });
    }
}
document.addEventListener('mouseup', highlightOnSelection);
