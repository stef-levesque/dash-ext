function getQuote(symbol, callback) {
	var api = 'http://finance.yahoo.com/d/quotes.csv?f=nl1&s=';
	var url = api + encodeURIComponent(symbol);
	$.get(url, callback);
}

function navigate(url) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.update(tabs[0].id, { url: url });
  });
}

chrome.omnibox.onInputChanged.addListener(
  function (text, suggest) {
		if (text.startsWith('stock')) {
			var quote = text.replace('stock ', '');
			getQuote(quote, function (data) {
				if (data === 'N/A,N/A\n') {
					chrome.omnibox.setDefaultSuggestion({
						description: '<url><match>quote:</match></url> Not found'
					});
				} else {
					chrome.omnibox.setDefaultSuggestion({
						description: '<url><match>quote:</match></url> ' + data.replace(',', ' ')
					});
				}
			});
		} else {
			suggest([
				{ content: "imdb", description: "search on the Internet Movie Data base" },
				{ content: "pin", description: "pin the current tab" },
				{ content: "stock", description: "show stock for specified quote" }
			]);
		}
  });

chrome.omnibox.onInputEntered.addListener(
  function (text) {
		if (text.startsWith('imdb')) {
			var q = text.replace('imdb ', '');
			navigate('http://www.imdb.com/find?q=' + encodeURIComponent(q));
		} else if (text == 'pin') {
			chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
				// Toggle the pinned status
				var current = tabs[0]
				chrome.tabs.update(current.id, { 'pinned': !current.pinned });
			});
		} else if (text.startsWith('stock')) {
			var q = text.replace('stock ', '');
			navigate('https://www.google.com/finance?q=' + encodeURIComponent(q));
		}
  });
	