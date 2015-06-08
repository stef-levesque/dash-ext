/// <reference path="../typings/chrome/chrome.d.ts" />

function extractTagName(str) {
	var e = document.getElementsByTagName(str)[0];
	if (e != null) {
		document.documentElement.style.overflow = 'hidden';
		document.body = document.createElement('body');
		document.body.appendChild(e);
		var w = window.outerWidth - window.innerWidth;
		var h = window.outerHeight - window.innerHeight;
		w += parseInt(document.defaultView.getComputedStyle(e).width, 10);
		h += parseInt(document.defaultView.getComputedStyle(e).height, 10);
		window.resizeTo(w, h);
	}
}

function extractShortcut(e) {
	if (e.altKey && e.keyCode == 86 /*V*/) {
		extractTagName('video');
	} else if (e.altKey && e.keyCode == 79 /*O*/) {
		extractTagName('object');
	}
}

document.addEventListener('keyup', extractShortcut, false);
