var RETRY = 10000;
var INTERVAL = 500;
var highlightErrors = [];
function addHighlightError(highlight) {
    highlightErrors.push({
        highlight: highlight,
        errorTime: Date.now()
    });
}
setInterval(() => {
    highlightErrors.forEach((highlightError, idx) => {
        if (Date.now() - highlightError.errorTime > RETRY) {
            highlightErrors.splice(idx, 1);
        } else {
            var result = load(highlightError.highlight, true);
            if (result) {highlightErrors.splice(idx, 1);}
        }
    });
}, INTERVAL);