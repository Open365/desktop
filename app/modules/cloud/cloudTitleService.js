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

define(['urlConfig'], function (urlConfig) {

	function CloudTitleService () {

	}

	CloudTitleService.prototype.setTitle = function (fileName, appName) {
		var title = "Open365";

		if (urlConfig.app) {
			fileName = fileName || this.getFileName();
			appName = appName || this.getAppName();
			title = fileName + " - " + appName + " - Open365";
		}

		document.title = title;
	};

	CloudTitleService.prototype.getFileName = function () {
		var appInfo;
		try {
			appInfo = JSON.parse(urlConfig.app);
		} catch (err) {
			appInfo = ['nonexistent', ""];
		}

		var filepath = appInfo[1];

		var filename = "";
		if (filepath) {
			filename = filepath.split('/').pop();
		}

		return filename;
	};

	CloudTitleService.prototype.getAppName = function () {
		var appInfo;
		try {
			appInfo = JSON.parse(urlConfig.app);
		} catch (err) {
			appInfo = ['nonexistent', ""];
		}

		var appNameWithoutFilePath = appInfo[0];

		var appTitle = {
			files: "Files",
			mail: "Mail",
			calc: "Spreadsheet",
			presentation: "Presentation",
			writer: "Writer",
			gimp: "Gimp"
		};

		return appTitle[appNameWithoutFilePath];

	};

	CloudTitleService.prototype.changeFileName = function (filepath) {
		this.setTitle(filepath.split('/').pop());
	};

	return CloudTitleService;
});
