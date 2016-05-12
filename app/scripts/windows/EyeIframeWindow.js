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
define([], function () {
	function EyeIframeWindow(url, options) {
		this.url = url;
		this.options = options;

		this.contents = null;

		options.needId = true;
	}

	EyeIframeWindow.className = "EyeIframeWindow";

	EyeIframeWindow.prototype.getContents = function (element, $compile, scope) {
		var template = '<iframe type="text/html" ng-src="{{url}}" class="{{title}}" width="900" height="500" allowfullscreen frameborder="0"></iframe>';
		element.html(template);
		this.contents = element.contents();
		$compile(this.contents)(scope);

		return this.contents;
	};

	EyeIframeWindow.prototype.getPosition = function () {
		return {
			x: 50,
			y: 50
		};
	};

	EyeIframeWindow.prototype.getWidth = function () {
		return this.contents.width();
	};

	EyeIframeWindow.prototype.getHeight = function () {
		return this.contents.height();
	};

	EyeIframeWindow.prototype.getOptions = function () {
		return this.options;
	};



	return EyeIframeWindow;
});
