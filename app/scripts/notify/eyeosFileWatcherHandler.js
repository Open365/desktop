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
	'utils/ProtocolResolver',
	'eyeosSchemes'
], function (ProtocolResolver, eyeosSchemes) {

	function eyeosFileWatcherHandler() {
	}

	eyeosFileWatcherHandler.prototype.onPushFileSystem = function (info) {
		var size = info.length,
			newMessage, data, resolver;
		try {
			resolver = eyeosSchemes.getResolver('cdn', null);
			for (var i = 0; i < size; i++) {
				newMessage = info[i];
				newMessage.data = JSON.parse(newMessage.data);
				data = newMessage.data[0];
				if (ProtocolResolver.getProtocol(data.path) === "print" && !resolver.isEyeosPathEmpty(data.path)
					&& (data.event === "CREATE" || data.event === "MOVED_TO")) {
					DesktopBus.dispatch("printFile", data);
				} else {
					DesktopBus.dispatch("filesystemapp", newMessage);
				}
			}
		} catch (e) {
			console.error(e);
		}
	};

	return eyeosFileWatcherHandler;
});
