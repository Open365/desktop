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

define(['settings'], function (settings) {
	function CloudResizer(app, vdiContainerName) {
		this.app = app;
		this.vdiContainerName = vdiContainerName;
	}

	CloudResizer.prototype.prepareAutoResize = function () {
		var resizeTimeout;
		var self = this;
		$(window).resize(function () {
			clearTimeout(resizeTimeout);
			resizeTimeout = window.setTimeout(self.resize.bind(self), settings.VDI_RESIZE_TIMEOUT);
		});
	};

	CloudResizer.prototype.getContainer = function () {
		return $('#' + self.vdiContainerName);
	};

	CloudResizer.prototype.resize = function () {
		var self = this;

		window.setTimeout(function () {
			var container = self.getContainer();
			var resolution = self.app.toSpiceResolution({
				width: container.width(),
				height: container.height()
			});

			var cmd = "setcustomresolution " + resolution.width + " " + resolution.height + " 59.90";
			self.app.sendCommand('run', {"cmd": cmd});
		}, 100)
	};

	return CloudResizer;
});
