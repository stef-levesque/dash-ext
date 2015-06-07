/// <reference path="../typings/chrome/chrome.d.ts" />
/// <reference path="../typings/jquery/jquery.d.ts"/>
/// <reference path="../js/jquery-2.1.4.min.js" />
/// <reference path="../js/qrcode.min.js" />

'use strict';

var qr = null;

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
	// Query filter to be passed to chrome.tabs.query - see
	// https://developer.chrome.com/extensions/tabs#method-query
	var queryInfo = {
		active: true,
		currentWindow: true
	};

	chrome.tabs.query(queryInfo, function (tabs) {
		// chrome.tabs.query invokes the callback with a list of tabs that match the
		// query. When the popup is opened, there is certainly a window and at least
		// one tab, so we can safely assume that |tabs| is a non-empty array.
		// A window can only have one active tab at a time, so the array consists of
		// exactly one tab.
		var tab = tabs[0];
	
		// A tab is a plain object that provides information about the tab.
		// See https://developer.chrome.com/extensions/tabs#type-Tab
		var url = tab.url;
		
		// tab.url is only available if the "activeTab" permission is declared.
		// If you want to see the URL of other tabs (e.g. after removing active:true
		// from |queryInfo|), then the "tabs" permission is required to see their
		// "url" properties.
		console.assert(typeof url == 'string', 'tab.url should be a string');

		callback(url);
	});

	// Most methods of the Chrome extension APIs are asynchronous. This means that
	// you CANNOT do something like this:
	//
	// var url;
	// chrome.tabs.query(queryInfo, function(tabs) {
	//   url = tabs[0].url;
	// });
	// alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

function renderStatus(statusText) {
	if (statusText == '') {
		$('#status').text('Dashboard').addClass('placeholder');
	} else {
		$('#status').text(statusText).removeClass('placeholder');
	}
}

function popoutUrl(params) {
	getCurrentTabUrl(function (url) {
		window.open(url, 'detab', 'toolbar=0');
	});
}

function makeQR() {
	getCurrentTabUrl(function (url) {
		if (qr == null) {
			// Creates a new QRCode object, by passing a reference to a DOM element
			// and specifing the desired dimensions
			qr = new QRCode($('#qrcode')[0], {
				width: 100,
				height: 100
			});
		}
		
		qr.clear();
		qr.makeCode(url);
	});
}

$().ready(function () {
	
	// Bind commands
	$('#commands img').hover( function () {renderStatus( $(this).attr('alt') );}, function () {renderStatus('');} );
	
	$('#popout').click(popoutUrl);
	$('#makeqr').click(makeQR);

});
