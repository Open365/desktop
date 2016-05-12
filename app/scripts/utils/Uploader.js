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

define(function() {
	var Uploader = function () {
	};

	Uploader.prototype.open = function (folderPath) {
		var body = document.getElementsByTagName('body')[0];

		var overlay = document.createElement('div');
		this.overlay = overlay;
		overlay.style.width = '100%';
		overlay.style.height = '100%';
		overlay.style.position = 'absolute';
		overlay.style.top = '0px';
		overlay.style.left = '0px';
		overlay.style.right = '0px';
		overlay.style.bottom = '0px';
		overlay.style.backgroundColor = 'black';
		overlay.style.opacity = '0.5';
		overlay.style.zIndex = 9999999999998;

		body.appendChild(overlay);

		var iframe = document.createElement('iframe');
		this.iframe = iframe;
		iframe.setAttribute('id', 'uploadIframe');
		iframe.setAttribute('src', '/fileuploader/index.html?path=' + folderPath);
		iframe.style.width = '480px';
		iframe.style.height = '292px';
		iframe.style.position = 'absolute';
		iframe.style.top = '0px';
		iframe.style.left = '0px';
		iframe.style.right = '0px';
		iframe.style.marginLeft = 'auto';
		iframe.style.marginRight = 'auto';
		iframe.style.zIndex = 9999999999999;
		iframe.style.borderTop ='black 1px solid';
		iframe.style.borderBottom= 'black 1px solid';
		iframe.style.borderLeft = 'black 1px solid';
		iframe.style.borderRight = 'black 1px solid';

		body.appendChild(iframe);

		// FIXME: This should be removed in the future, and the uploader should
		// communicate with us via the desktop bus
		window.document.eyeosUploader = this;
	};

	Uploader.prototype.close = function () {
		document.body.removeChild(this.iframe);
		document.body.removeChild(this.overlay);
	};

	return Uploader;
});
