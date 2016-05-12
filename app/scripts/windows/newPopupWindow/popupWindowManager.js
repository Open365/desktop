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
define([
    'windows/newPopupWindow/popupWindow',
    'windows/newPopupWindow/popupWindowFactory',
    'windows/newPopupWindow/openedPopupWindows',
    'windows/newPopupWindow/popupWindowOffsets',
    'utils/desktopBus',
    'windows/newPopupWindow/screen',
    'system/operatingSystem'
], function(PopupWindow, popupWindowFactory,  OpenedPopupWindows, PopupWindowOffsets, DesktopBus, ScreenChangeDetector,
            OperatingSystem) {


    function PopupWindowManager($baseElement, fakePopupWindowFactory, openedPopupWindows,
                                fakeDocument, injectedPopupWindowOffsets, bus, screenChangeDetector) {
        this.el = $baseElement;
        this.createWindow.fromElement = this.createWindow.fromElement.bind(this);
        this.popupWindowFactory = fakePopupWindowFactory ||  popupWindowFactory;
        this.initialized = false;
        this.openedPopupWindows = openedPopupWindows || new OpenedPopupWindows();
        this.document = fakeDocument || document;
        this.popupWindowOffsets = injectedPopupWindowOffsets || new PopupWindowOffsets();
        this.bus = bus || DesktopBus;
        this.screenChangeDetector = screenChangeDetector || new ScreenChangeDetector(this.popupWindowOffsets);
        this.name = 'popup';
        this.setOnUnload();
        this._osIsMacWithExtension = OperatingSystem.getName() === OperatingSystem.MACOSX && OperatingSystem.getBrowser().isExtensionInstalled();
        this._resizeInterval = null;
    }

    PopupWindowManager.prototype.setOnUnload = function() {
        this.bus.subscribe('unloadDesktop', this.dispose.bind(this));
    };

    PopupWindowManager.prototype.dispose = function() {
        if(this._resizeInterval) {
            clearInterval(this._resizeInterval);
        }
        this.openedPopupWindows.close();
    };

    PopupWindowManager.prototype._isFullScreen = function() {
        var isMaxHeight = screen.availHeight <= window.outerHeight;
        var isMaxWidth = screen.availWidth <= window.outerWidth;
        if(OperatingSystem.getName() === OperatingSystem.MACOSX) {
            return isMaxHeight;
        }
        return isMaxHeight && isMaxWidth;
    };

    PopupWindowManager.prototype._addRecoverFocusHandlerToDocument = function() {
        var self = this;
        if (!this.initialized) {
            this.initialized = true;
            window.addEventListener("focus", function() {
                if (self._isFullScreen()) {
	                    self.openedPopupWindows.recoverFocus.bind(self.openedPopupWindows);
                }
            });
            window.addEventListener("mousedown", function() {
                if (self._isFullScreen()) {
                    self.openedPopupWindows.recoverFocus();
                }
            });
        }
    };

    //DUMMY CONTRACT FOR COMPATIBILITY
    PopupWindowManager.prototype.createWindow = function(){};

    PopupWindowManager.prototype.createWindow.fromElement = function(domElement, options) {
        this._addRecoverFocusHandlerToDocument();
        return this.popupWindowFactory.getWindowFromElement(domElement, options, this.popupWindowOffsets, this.openedPopupWindows);
    };

    PopupWindowManager.prototype._sendMessageToExtension = function(messageName, data){
        if(!data) {
            data = {};
        }
		var event = new CustomEvent(messageName, {detail: data});
		document.dispatchEvent(event);
    };

    PopupWindowManager.prototype.init = function() {
        var self = this;
	    window.needToSetResolution = true;
        if(this._osIsMacWithExtension) {
            self._sendMessageToExtension("identifymetochromeextension");
            window.addEventListener("message", function(msg) {
                if (msg.data.event === "eyeosidentifiedbychromeextension") {
                    console.info("Indentification from extension finished: ", msg.data);
                    self._resizeInterval = setInterval(function() {
                        self._sendMessageToExtension("setWindowMaximizedIfFullscreen", {tabId : msg.data.tabId, chromeWindowId: msg.data.chromeWindowId});
                    }, 1000);
                }
             });
        }
    };

    PopupWindowManager.prototype._resetOpenedPopupsOnDesktopScreenChange = function(currentDesktopSize, currentDesktopCoordinates) {
        var self = this;
        var isInSameScreen = this.screenChangeDetector.isIn(true, currentDesktopSize, currentDesktopCoordinates);
        if(!isInSameScreen){
            this.popupWindowOffsets.detect(null, null, function () {
                self.openedPopupWindows.reset();
            });
        }
    };


    PopupWindowManager.prototype._onDesktopMoveResetPopups = function() {
        var self = this;
	    // This throttle avoids calling multiple times the resetPopup each N secs.
	    // Also avoids waiting for some milliseconds that the browser needs the detect that the screen has changed.
	    var throttledResetOpenedPopupsOnScreenChange = _.throttle(function (data) {
		    self._resetOpenedPopupsOnDesktopScreenChange(data.desktopWindow.screen, data.desktopWindow);
	    }, 1000, {
		    leading: false
	    });

	    this.bus.subscribe('desktopMoved', throttledResetOpenedPopupsOnScreenChange);
    };

    PopupWindowManager.prototype.getFrameDelta = function() {
        return {
            width: 0,
            height: 0
        };
    };

    return PopupWindowManager;
});
