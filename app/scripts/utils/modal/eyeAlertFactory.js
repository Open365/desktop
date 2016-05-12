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

define(['appModule', 'utils/desktopBus'], function(AppModule, DesktopBus) {
	angular.module('eyeDesktopApp')
		.service('EyeAlertFactory', function () {

			var EyeAlertFactory = {
				factoryMap : {
					"NODE_EXISTS": _constructNodeExistAlert
				},
				constructFromData: function(message) {
					if(EyeAlertFactory.factoryMap[message.type]) {
						return EyeAlertFactory.factoryMap[message.type](message);
					}else {
						return _constructDefaultAlert(message);
					}
				}
			};

			function _constructNodeExistAlert (message){
				var data = message.data;
				var type = message.type;
				return _constructAlert(
					"File/Folder Already Exists",
						"The name \""+data.name+"\" is already taken. Please choose a different name.",
					function() {
						DesktopBus.dispatch("displayAlertAccepted", {"type":type});
					}
				);
			}

			function _constructDefaultAlert (data){
				return _constructAlert(
					data.title,
					data.msg,
					data.ok
				);
			}

			function _constructAlert (title, msg, fp) {
				return {
					"title": title,
					"msg": msg,
					icon: 'images/icons/alert.png',
					ok: fp
				};
			}

			return EyeAlertFactory;
		});
});