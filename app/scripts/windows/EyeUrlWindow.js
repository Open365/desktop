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
	function EyeUrlWindow(url, options) {
		this.url = url;
		this.options = options;

		this.contents = null;

		options.needId = true;
	}

	EyeUrlWindow.prototype.getContents = function () {
		var script   = document.createElement("script");
		script.type  = "text/javascript";
		script.text  = "location.href='"+this.options.appData.url+"'";
		this.contents = $(script);
		return this.contents;
	};

	EyeUrlWindow.prototype.getPosition = function () {
		return {
			x: 50,
			y: 50
		};
	};

	EyeUrlWindow.prototype.getWidth = function () {
		return this.options.appData.settings.minSize.width;
	};

	EyeUrlWindow.prototype.getHeight = function () {
		return this.options.appData.settings.minSize.height;
	};

	EyeUrlWindow.prototype.getOptions = function () {
		return this.options;
	};
	return EyeUrlWindow;
});
