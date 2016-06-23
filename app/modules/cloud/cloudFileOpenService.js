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

define([], function () {

	function CloudFileOpenService ($translate, eyeosLocationService, cloudTitleService) {
		this.$translate = $translate;
		this.eyeosLocationService = eyeosLocationService;
		this.cloudTitleService = cloudTitleService;
	}

	CloudFileOpenService.prototype.launchApp = function (app) {
		var encodedApp = encodeURIComponent(JSON.stringify(app));
		window.open('/?EYETHEME_NAME=eyeos-cloud-app&app=' + encodedApp, '_blank');
	};

	CloudFileOpenService.prototype.start = function () {
		var self = this;
		window.DesktopBus.subscribe('eyeosCloud.fileOpened', function (data) {
			var app = self._getAppByFilename(data);

			if (data.path.indexOf('https://') === 0 || data.path.indexOf('http://') === 0) {
				BootstrapDialog.show({
					message: self.$translate.instant('The link will open in a new window'),
					buttons: [{
						id: 'open-link-new-window',
						label: self.$translate.instant('Ok'),
						cssClass: 'btn-txt btn-ok',
						action: function (dialog) {
							dialog.close();
							window.open(data.path, '_blank');
						}
					}, {
						id: 'open-link-new-window-cancel',
						label: self.$translate.instant('Cancel'),
						cssClass: 'btn-txt btn-ko',
						action: function (dialog) {
							dialog.close();
						}
					}]
				});

			} else {
				if (app) {
					if (app === 'newTab') {
						window.DesktopBus.dispatch('fileDownloadNewTab', data);
					} else {
						self.launchApp([app, data.path]);
					}

				} else {
					window.DesktopBus.dispatch('fileDownload', data);
				}
			}
		});

		window.DesktopBus.subscribe("eyeosCloud.filePathChange", function (data) {
			data.url = "/";

			if(data.path && data.path.length > 0) {
				data.app = self._getAppByFilename(data);
				if(data.app && data.app.length > 0) {
					self.eyeosLocationService.searchWithoutReloading(
						'app',
						JSON.stringify([data.app, data.path]),
						data
					);
					self.cloudTitleService.changeFileName(data.path);
				} else {
					console.info('We cannot get the app name');
				}
			}
		});
	};

	CloudFileOpenService.prototype._getAppByFilename = function(data) {
		var ext = data.path.split('.').pop().toLowerCase();

		var appPerExtension = {
			'xls': 'calc',
			'xlsx': 'calc',
			'ods': 'calc',
			'csv' : 'calc',
			'txt': 'writer',
			'doc': 'writer',
			'docx': 'writer',
			'odt': 'writer',
			'ppt': 'presentation',
			'pptx': 'presentation',
			'pps': 'presentation',
			'ppsx': 'presentation',
			'odp': 'presentation',
			'pdf': 'newTab',
			'avi': 'gimp',
			'bmp': 'gimp',
			'cel': 'gimp',
			'fits': 'gimp',
			'fli': 'gimp',
			'gif': 'gimp',
			'hrz': 'gimp',
			'jpeg': 'gimp',
			'jpg': 'gimp',
			'miff': 'gimp',
			'pcx': 'gimp',
			'pix': 'gimp',
			'png': 'gimp',
			'pnm': 'gimp',
			'ps' : 'gimp',
			'sgi': 'gimp',
			'sunras': 'gimp',
			'tga': 'gimp',
			'tiff': 'gimp',
			'xbm': 'gimp',
			'xcf': 'gimp',
			'xpm': 'gimp',
			'xwd': 'gimp'

		};

		return appPerExtension[ext];
	};

	return CloudFileOpenService;
});
