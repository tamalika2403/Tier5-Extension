"use strict";
var backgroundPage = chrome.extension.getBackgroundPage();

var highlightBtn = document.getElementById('highlight');
var removeHighlightsBtn = document.getElementById('remove');
var colors = document.getElementsByName('color');


function removeHighlights() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (!tabs[0].url.includes("chrome://")) {
            backgroundPage.removeHighlights();
            window.close();
        }
    });
}

function updateColor(color) {
    backgroundPage.saveColor(color);
}

function removeSelected() {
    var selected = document.getElementsByClassName('selected');
    for (var i = 0; i < selected.length; i++) {
        selected[i].classList.remove('selected');
    }
}

function toggleHighlight() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (!tabs[0].url.includes("chrome://")) {
            backgroundPage.toggleHighlight();
            window.close();
        }
    });
}

function toggleHighlightByColor() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (!tabs[0].url.includes("chrome://")) {
            backgroundPage.toggleHighlightByColor();
            window.close();
        }
    });
}

chrome.storage.sync.get('color', (values) => {
    var color = values.color;

    colors.forEach((radio) => {
        radio.addEventListener("click", (e) => { 
            updateColor(e.target.value);
            removeSelected();
            e.target.parentNode.classList.add('selected');
            toggleHighlightByColor();
        });

        if (radio.value === color) { 
            removeSelected();
            radio.parentNode.classList.add('selected');
        }
    });
});


highlightBtn.addEventListener('click', toggleHighlight);
removeHighlightsBtn.addEventListener('click', removeHighlights);


chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (!tabs[0].url.includes("chrome://")) {
        chrome.tabs.sendMessage(tabs[0].id, {type: "getCursor"}, function(response) {
            if (response.getCursor) {
                highlightBtn.innerText = "Turn off";
            } else {
                highlightBtn.innerText = "Turn on";
            }
        });
    }
});