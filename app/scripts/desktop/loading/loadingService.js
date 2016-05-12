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

define([
	'windows/windowInfo/windowInfoFactory'
], function (WindowInfoFactory) {

	function LoadingService (windowInfoFactory){
		this.windowInfoFactory = windowInfoFactory || new WindowInfoFactory();
		this.loadings = [];
	}

	LoadingService.prototype.openLoading = function (newScope, tplPath, openType) {
		var loadingInfo = this.windowInfoFactory.getLoadingInfo(newScope, tplPath);
		loadingInfo.setOpenType(openType);
		this.loadings.push(loadingInfo);
	};

	LoadingService.prototype.closeLoading = function () {
		var loadingData = this.loadings[this.loadings.length - 1];
		loadingData && loadingData.eyeWindow.close();
	};

	LoadingService.prototype.removeLoading = function () {
		this.loadings.pop();
	};

	LoadingService.prototype.reopenLoading = function (loadingWindowInfo) {
		this.loadings.push(loadingWindowInfo);
	};

	LoadingService.prototype.getLastLoading = function () {
		return this.loadings[this.loadings.length - 1];
	};

	LoadingService.prototype.replaceLastLoadingAppTemplate = function (templateKey) {
		var self = this;
		var loadingApp = this.getLastLoading();
		if(loadingApp) {
			loadingApp.replaceTemplate(templateKey, function () {
				self.removeLoading();
			});
		} else {
			console.warn('LoadingService: vdiWindowError called but there are no loaddingApps left');
		}
	};

	return LoadingService;
});
