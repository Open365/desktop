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
    'windows/newPopupWindow/urlParameters',
    'windows/newPopupWindow/popupFactory',
    'windows/ventusWindow/ventusFactory',
    'windows/newPopupWindow/popupFactory',
    'windows/focusDetector',
	'settings'
], function(UrlParameters, PopupFactory, VentusFactory, newWindowFactory, FocusDetector, settings) {

    function WindowManagerFactory(urlParameters, popupFactory, ventusFactory, focusDetector) {
        this.urlParameters = urlParameters || new UrlParameters();
        this.ventusFactory = ventusFactory || new VentusFactory();
        this.newPopup = popupFactory || new newWindowFactory();
        this.focusDetector = focusDetector || FocusDetector.getInstance();
    }

    WindowManagerFactory.prototype.init = function(baseDiv){
        this._popupWindowManager = this.newPopup.getWindowManager(baseDiv);
	    this._ventusWindowManager = this.ventusFactory.getWindowManager(baseDiv);
	    this._windowManagerMapByType = {
			undefined: this.getVentusManager(),
			"": this.getVentusManager(),
			"eyeos_application": this.getVentusManager(),
			"attached_application": this.getVentusManager(),
			"detached_application": this.getPopupManager(),
			"eyeos_vdi_application": this.getPopupManager(),
			"external_application":this.getPopupManager()
	    };

	    this._windowManagerStrategyBySettings = {
			'ventus':this.getVentusManager,
			'popup': this.getPopupManager,
		    'auto': this._getWindowManagerByType,
		    'mixed': this._getWindowManagerByCurrentFocus
	    };

	    this._windowManagerMapByFocus = {
			'desktop': this.getVentusManager,
			'popup': this.getPopupManager
	    };

	    this.focusDetector.registerWindow(window, 'desktop');
    };

	WindowManagerFactory.prototype.getVentusManager = function() {
		return this._ventusWindowManager;
	};

	WindowManagerFactory.prototype.getPopupManager = function() {
		return this._popupWindowManager;
	};

	WindowManagerFactory.prototype._getWindowManagerByType = function(scope) {
		var wm = this._windowManagerMapByType[scope.appData.type];
		wm = this._applyRestrictions(wm, scope.appData);
		return wm;
	};

	WindowManagerFactory.prototype._applyRestrictions = function(defaultWM, appData) {
		var returnedWM = defaultWM;
		if(appData.openType === 'detached_application'){
			returnedWM = this._popupWindowManager;
		} else if(appData.openType === 'attached_application'){
			returnedWM = this._ventusWindowManager;
		}
		return returnedWM;
	};

	WindowManagerFactory.prototype._getWindowManagerByCurrentFocus = function(scope) {
		var wm = this._windowManagerMapByFocus[this.focusDetector.getLastFocused()].call(this);
		wm = this._applyRestrictions(wm, scope.appData);
		return wm;
	};

    WindowManagerFactory.prototype.getWindowManager = function(scope) {
	    return this._windowManagerStrategyBySettings[settings.WINDOW_MANAGER_STRATEGY].call(this, scope);
    };

    return WindowManagerFactory;
});
