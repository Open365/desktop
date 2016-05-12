if (!window.lang) {
	window.lang = {};
}
function tr(message, tokens) {
	var result = (window.i18n)?i18n.t(message) : message;
	if (tokens)
		for (var i = 0; i < tokens.length; i++)
			result = result.replace(/%s/, tokens[i]);
	return result;
}
