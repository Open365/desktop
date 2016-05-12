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
	'app/appInfo'
], function (AppInfo) {

	function WindowInfoFactory() {
	}

	WindowInfoFactory.prototype.getFeedbackInfo = function (newScope, tplPath) {
		var loadingInfo = new AppInfo("feedbackAPP", 'Feedback', 'Feedback', 'detached_application');
		loadingInfo.setSettings({
			minSize: {
				height: 300,
				width: 510
			}
		});
		loadingInfo.setClassName('eyeosNoTopbar');
		loadingInfo.setTplPath(tplPath);
		loadingInfo.setTplScope(newScope);
		loadingInfo.setIsTemplateWindow(true);
		loadingInfo.setOpenType('detached_application');
		return loadingInfo;
	};

	WindowInfoFactory.prototype.getLoadingInfo = function (newScope, tplPath) {
		var loadingInfo = new AppInfo("LoadingAPP",'\u200E', 'Loading', 'eyeos_application');
		loadingInfo.setSettings({
			minSize: {
				height: 142,
				width: 345
			}
		});
		loadingInfo.setIsLoading(true);
		loadingInfo.setClassName('eyeosNoTopbar');
		loadingInfo.setTplPath(tplPath);
		loadingInfo.setTplScope(newScope);
		loadingInfo.setIsTemplateWindow(true);
		return loadingInfo;
	};

	return WindowInfoFactory;
});
