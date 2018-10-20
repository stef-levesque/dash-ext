/// <reference path="../js/jquery-3.3.1.min.js" />
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

function clearup() {
	$('#outputs').children('div').addClass('hidden');
}

function picInPic() {
	var code = `
		if (document.pictureInPictureElement) {
			document.exitPictureInPicture();
		} else {
			let v = window.document.getElementsByTagName('video')[0];
			if (v) {
				v.requestPictureInPicture();
			}
		}
	`

	chrome.tabs.executeScript({
		code: code,
		allFrames: true
	});
}

function popoutUrl(params) {
	getCurrentTabUrl(function (url) {
		window.open(url, 'detab', 'toolbar=0');
	});
}

function makeQR() {
	clearup();
	getCurrentTabUrl(function (url) {
		if (qr == null) {
			// Creates a new QRCode object, by passing a reference to a DOM element
			// and specifing the desired dimensions
			qr = new QRCode($('div#qrcode')[0], {
				width: 100,
				height: 100
			});
		}
		
		qr.clear();
		qr.makeCode(url);
	});
	$('div#qrcode').removeClass('hidden');
}

function fetchWeather(city) {
	city = typeof city !== 'undefined' ? city : 'montreal,qc';
	
	var api = 'https://query.yahooapis.com/v1/public/yql?format=json&q=';
	var req = 'select * from weather.forecast where u=\'c\' and woeid in (select woeid from geo.places(1) where text="' + city + '")';
	var url = api + encodeURIComponent(req);
	
	var jqxhr = $.getJSON(url, function () {
		var resp = jqxhr.responseJSON;
		var desc = resp.query.results["channel"]["item"]["description"];
		
		$('div#forecast').contents().remove();
		$('div#forecast').append(desc);
		$('div#forecast').removeClass('hidden');
	});

}

function showWeather() {
	clearup();
	fetchWeather();
}

function fetchQuote(symbol) {
	symbol = typeof symbol !== 'undefined' ? symbol : 'EA';
	
	// from https://web.archive.org/web/20140329232231/http://www.gummy-stuff.org/Yahoo-data.htm
	// n:name; g:day's low; h:day's high; j:52w low; k:52w high; c6:change now
	var api = 'http://finance.yahoo.com/d/quotes.csv?f=l1&s=';
	var url = api + encodeURIComponent(symbol);
	
	$.get(url, function (data) {
		$('div#quote')[0].textContent = symbol + ': ' + data; 
		$('div#quote').removeClass('hidden');
	});
}

function showQuote() {
	clearup();
	fetchQuote();
}

jQuery(function () {
	
	// Bind commands
	$('#commands img').hover( function () {renderStatus( $(this).attr('alt') );}, function () {renderStatus('');} );
	
	$('#picinpic').click(picInPic);
	$('#popout').click(popoutUrl);
	$('#makeqr').click(makeQR);
	$('#weather').click(showWeather);
	$('#stock').click(showQuote);

});
