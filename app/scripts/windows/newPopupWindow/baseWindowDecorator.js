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
    function BasePopupWindowDecorator(internalWindow) {
        this._internalWindow = internalWindow;
        this.signals = this._internalWindow.getSignals();
    }

    BasePopupWindowDecorator.prototype.getId = function () {
        return this._internalWindow.getId();
    };

    BasePopupWindowDecorator.prototype.setSingleScreen = function(singleScreen) {
        this._internalWindow.setSingleScreen(singleScreen);
    };

    BasePopupWindowDecorator.prototype.setUnclosable = function(uncloseable) {
        this._internalWindow.setUnclosable(uncloseable);
    };

    BasePopupWindowDecorator.prototype.setReadyCallBack = function(fp) {
        this._internalWindow.setReadyCallBack(fp);
    };

    BasePopupWindowDecorator.prototype.getPopupPointer = function() {
        return this._internalWindow.getPopupPointer();
    };

    BasePopupWindowDecorator.prototype.get$content = function() {
        return this._internalWindow.get$content();
    };

    BasePopupWindowDecorator.prototype.getTopbar = function() {
        return this._internalWindow.getTopbar();
    };

    BasePopupWindowDecorator.prototype.getSignals = function() {
        return this._internalWindow.getSignals();
    };

    BasePopupWindowDecorator.prototype.closeSilent = function() {
        this._internalWindow.closeSilent();
    };

    BasePopupWindowDecorator.prototype.close = function() {
        this._internalWindow.close();
    };

    BasePopupWindowDecorator.prototype.move = function(x, y) {
        this._internalWindow.move(x,y);
    };

    BasePopupWindowDecorator.prototype.resizeContent = function(width, height) {
        this._internalWindow.resizeContent(width, height);
    };

    BasePopupWindowDecorator.prototype.minimize = function() {
        this._internalWindow.minimize();
    };

    BasePopupWindowDecorator.prototype.maximize = function() {
        this._internalWindow.maximize();
    };

    BasePopupWindowDecorator.prototype.focus = function() {
        this._internalWindow.focus();
    };

    BasePopupWindowDecorator.prototype.getIsVdiWindow = function() {
        return this._internalWindow.getIsVdiWindow();
    };

    BasePopupWindowDecorator.prototype.enableFocus = function(enable) {
        this._internalWindow.enableFocus(enable);
    };

    BasePopupWindowDecorator.prototype.displayMessage = function(data) {
        this._internalWindow.displayMessage(data);
    };

    BasePopupWindowDecorator.prototype.open = function(relativeCoordinates, resettingPopup) {
        this._internalWindow.open(relativeCoordinates, resettingPopup);
    };

    BasePopupWindowDecorator.prototype.setWindowReady = function(domElement) {
        this._internalWindow.setWindowReady(domElement);
    };

    BasePopupWindowDecorator.prototype.resetPopup = function(skipClose, width, height) {
        this._internalWindow.resetPopup(skipClose, width, height);
    };

    BasePopupWindowDecorator.prototype.removeMessage = function() {
        this._internalWindow.removeMessage();
    };

    BasePopupWindowDecorator.prototype.replaceContent = function(domElement) {
        this._internalWindow.replaceContent(domElement);
    };

    BasePopupWindowDecorator.prototype.getX = function() {
        return this._internalWindow.getX();
    };

    BasePopupWindowDecorator.prototype.getY = function() {
        return this._internalWindow.getY();
    };

    BasePopupWindowDecorator.prototype.readyPostActions = function(content) {
      if(this._internalWindow.readyPostActions) {
          this._internalWindow.readyPostActions(content);
      }
    };

    return BasePopupWindowDecorator;
});
