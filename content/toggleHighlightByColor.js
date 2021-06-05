"use strict";
window.showHighlighterCursor = true;
if (window.showHighlighterCursor) {document.body.style.cursor = `url(${chrome.extension.getURL('icons/cursor.png')}), auto`; highlightOnSelection();}