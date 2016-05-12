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

	function EyeCanvasWindow(appData, options) {
		this.appData = appData;
		this.options = options;

		this.canvas = appData.canvas;
		this.contents = $('<div></div>');
		this.contents.append(appData.eventLayer);
		this.contents.append(appData.canvas);

		options.maximized = this.appData.zoomed;
		options.disableContinuousResizeEvents = true;
		options.dontExecuteEventHandlers = true;
		options.hideContentOnExpose = true;
	}

	EyeCanvasWindow.prototype.getContents = function () {
		return this.contents;
	};

	EyeCanvasWindow.prototype.getPosition = function () {
		var x = parseInt(this.appData.left, 10);
		var y = parseInt(this.appData.top, 10);

		if (!x && x !== 0) {
			x = 50;
		}

		if (!y && y !== 0) {
			y = 50;
		}
		return {
			x: x,
			y: y
		};
	};

	EyeCanvasWindow.prototype.getWidth = function () {
		return this.canvas.width;
	};

	EyeCanvasWindow.prototype.getHeight = function () {
		return this.canvas.height;
	};

	EyeCanvasWindow.prototype.getOptions = function () {
		return this.options;
	};



	return EyeCanvasWindow;
});