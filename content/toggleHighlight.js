"use strict";
window.showHighlighterCursor = !window.showHighlighterCursor;
if (window.showHighlighterCursor) {document.body.style.cursor = `url(${chrome.extension.getURL('icons/cursor.png')}), auto`; highlightOnSelection();} else {document.body.style.cursor = 'default';}
