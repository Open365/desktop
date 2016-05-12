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
define(['settings'], function(settings) {
	function OpenedPopupWindows(injectedSettings) {
		this._settings = injectedSettings || settings;
		this.openedPopups = [];
	}

    OpenedPopupWindows.prototype.popupOpened = function(popupWindow) {
        this.openedPopups.push(popupWindow);
    };

    OpenedPopupWindows.prototype.getNumberOfWindows = function() {
        return this.openedPopups.length;
    };

    OpenedPopupWindows.prototype.recoverFocus = function() {
        if(this._settings.DESKTOP_MODE_RECOVER_WINDOW) {
	        this._allPopupsNoMinimized('enableFocus', [false]);
	        this._allPopupsNoMinimized('focus');
        }
    };

    OpenedPopupWindows.prototype.exists = function(popupWindow) {
        for(var i=0;i<this.openedPopups.length;i++) {
            if(this.openedPopups[i].id === popupWindow.id) {
                return true;
            }
        }
        return false;
    };

    OpenedPopupWindows.prototype.getTopWindow = function() {
        return this.openedPopups[this.openedPopups.length-1];
    };

    OpenedPopupWindows.prototype.popupClosed = function(popupWindow) {
        for(var i=0;i<this.openedPopups.length;i++) {
            if(this.openedPopups[i].id === popupWindow.id) {
                this.openedPopups.splice(i, 1);
                break;
            }
        }
    };

    OpenedPopupWindows.prototype.moveToTop = function(popupWindow) {
        for(var i=0;i<this.openedPopups.length;i++) {
            if(this.openedPopups[i].id === popupWindow.id) {
                var extracted = this.openedPopups.splice(i, 1)[0];
                this.openedPopups.push(extracted);
                break;
            }
        }
    };

    OpenedPopupWindows.prototype.close = function() {
        this._allPopups('closeSilent');
    };

    OpenedPopupWindows.prototype.reset = function() {
	    this._allPopups('resetPopup', [true]);
    };

    OpenedPopupWindows.prototype._iterateAllPopups = function(fp, method, args) {
        var length = this.openedPopups.length;
        for(var i=0;i< length;i++) {
            var popUpWindow = this.openedPopups[i];
            fp.call(this, function(shouldDoAction) {
                if(shouldDoAction) {
                    popUpWindow[method].apply(popUpWindow, args);
                }
            }, popUpWindow);
        }
    };

    OpenedPopupWindows.prototype._allPopupsNoMinimized = function(method, args) {
        this._iterateAllPopups(function(fp, popupWindow){
           fp.call(this, !popupWindow._isHidden);
        }, method, args);
    };

    OpenedPopupWindows.prototype._allPopups = function(method, args) {
        this._iterateAllPopups(function(fp){
            fp.call(this, true);
        }, method, args);
    };
    return OpenedPopupWindows;
});
