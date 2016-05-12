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
	function EyeTemplateWindow(url, options) {
		this.url = url;
		this.options = options;

		this.contents = null;

		options.needId = true;
	}

	EyeTemplateWindow.prototype.getContents = function (element, $compile, scope) {
        var tplPath = scope.appData.tplPath;
        var template = '<div class="window-content-wrapper"><div ng-include=\'"' + tplPath + '"\'></div></div>';
        this.contents = $(template);
        $compile(this.contents)(scope.appData.tplScope);

        return this.contents;
	};

	EyeTemplateWindow.prototype.getPosition = function () {
		return {
			x: 250,
			y: 250
		};
	};

	EyeTemplateWindow.prototype.getWidth = function () {
		return this.options.appData.settings.minSize.width;
	};

	EyeTemplateWindow.prototype.getHeight = function () {
		return this.options.appData.settings.minSize.height;
	};

	EyeTemplateWindow.prototype.getOptions = function () {
		return this.options;
	};
	return EyeTemplateWindow;
});
