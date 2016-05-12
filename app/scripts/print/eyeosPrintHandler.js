/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';
define(function (eyeosPrintCleaner) {
	function eyeosPrintHandler(printId, $http, settings, iframe) {
		this.printId = printId;
		this.settings = settings;
		this.http = $http;
		this.iframe = iframe || $('<iframe></iframe>');
		this.iframeIdPrefix = 'printFileContainer';
	}

	function removeGarbage () {
		var iframes = $("iframe");
		for (var i = 0, max = iframes.length; i < max; i++) {
			if (iframes[i].id.indexOf(this.iframeIdPrefix) > -1) {
				iframes[i].remove();
			}
		}
	}

	eyeosPrintHandler.prototype.printMe = function (response) {
		removeGarbage.call(this);
		if (!this.printId) {
			this.printId = this.iframeIdPrefix + Math.floor(Math.random() * 10000);
		}
		this.iframe.attr({
			'id': this.printId,
			'width': 0,
			'height': 0,
			'src': response.data.url
		});
		this.iframe.appendTo('body');
	};

	return eyeosPrintHandler;
});
