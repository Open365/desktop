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

define(['windows/newPopupWindow/nativeWindow'], function(NativeWindow) {

    function ChromeExtensionWindow(id, title, minWidth, minHeight, workspaceScreen, offsets, singleScreen, emitter, url) {
	    NativeWindow.call(this, id, title, minWidth, minHeight, workspaceScreen, offsets, singleScreen, emitter, url);
	    this.chromeWindowId = null;
    }

	ChromeExtensionWindow.prototype = Object.create(NativeWindow.prototype);

    ChromeExtensionWindow.prototype.focus = function() {
		var event = new CustomEvent('focusWindow', {detail: {windowId: this.chromeWindowId}});
	    document.dispatchEvent(event);
    };

    ChromeExtensionWindow.prototype._executePostCreationActions = function() {
	    var self = this;

	    window.addEventListener("message", function(msg) {
			if (msg.data.event === "popupCreated" && self._id === msg.data.eyeWinId) {
				console.info("Content script received: ", msg.data);
				self.setChromeWindowId(msg.data.chromeWindowId);
			}
		});
    };

	ChromeExtensionWindow.prototype.setChromeWindowId = function(chromeWindowId) {
		this.chromeWindowId = chromeWindowId;
	};


    return ChromeExtensionWindow;
});
