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
	function FileShareController (desktopBus, bootstrapDialog) {
		this.desktopBus = desktopBus || window.DesktopBus;
		this.bootstrapDialog = bootstrapDialog || window.BootstrapDialog;
		this.shareMessage = "Your file share url is:<br>";
	}

	FileShareController.prototype.subscribe = function () {
		var self = this;
		this.desktopBus.subscribe('fileShare.downloadUrl', function (url) {

			self.bootstrapDialog.show({
				message: self.shareMessage + url,
				cssClass: 'file-share-url-dialog',
				// Dialog closes only when the close icon in dialog header was clicked
				closeByBackdrop: false,
				closeByKeyboard: false,
				buttons: [{
					label: 'OK',
					action: function (dialog) {
						dialog.close();
					}
				}]
			});
		});
	};

	return FileShareController;

});
