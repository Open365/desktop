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
define(['./urlConfig'], function (urlConfig) {

	function getConfigs(settingsMap) {
		var key;
		for (key in window.settingsStatic) {
			settingsMap[key] = window.settingsStatic[key];
		}

		for (key in urlConfig) {
			settingsMap[key] = urlConfig[key];
		}
		return settingsMap;
	}

	angular.module('settings', [])
		.constant('SETTINGS', getConfigs({
			'LOGIN_URL': '/applogin',
			'PRINCIPAL_SERVICE_URL': '/principalService/v1',
			'ENVIRONMENT': 'release', //develop or release
			'PEOPLE_GROUPS_ENABLED': true,
			'FILES_SERVER_URL': '/files/v1',
			'LOADING_APP_SHOW_IN_WINDOW': true
		}));

	var settings = getConfigs({
		'VDI_RESIZE_TIMEOUT': 100,
		'VDI_RECONNECTION_RETRY_TIME': 1000,
		'VDI_RECONNECTION_FREEZE_TIME': 4000,
		'VDI_RECONNECTION_CANCEL_TIME': 6000000,
		'VDI_RECONNECTION_FREEZE': false,
		'VDI_MAX_RESOLUTION_WIDTH': 1920,
		'VDI_MAX_RESOLUTION_HEIGHT': 1080,
		'VDI_FULL_DESKTOP_EXECUTION': '<<EXECUTION_SCRIPT_ROUTE>>', // Not needed with windows. It cannot be empty.
		'SPICE_CLIENT_PATH': '/bower_components/spice-web-client/',
		'SUPPORT_HIGH_DPI': false,
		'CONNECT_TO_BUS': true,
		'CONNECT_TO_CHAT': true,
		'CHAT_HOST': 'localhost',
		'EYETHEME_NAME': 'eyeos-cloud',
		'FALLBACK_PLATFORM_LANG': 'en',
		'SHOULD_GROUP_DESKTOP_ICONS': false,
		'EYETHEME_SASS_MODE': 'server', // client or server
		'LOADING_TIMEOUT': 120000,
		'MINIMUM_LATENCY': 2, //index of the minimum good latency of the LATENCY_SCALE
		'LATENCY_TIMEOUT': 2000, // in ms
		'LATENCY_SCALE': [200, 150, 100, 50], //worst to best in ms
		'LATENCY_PING_INTERVAL': 1000, // in ms
		'LATENCY_HISTORY_SIZE': 10, // Pings to keep to do the average
		'LATENCY_PINGS_TO_TRUNCATE': 1,
		'EYEOS_EXTENSION_INSTALLED_MARK': 'eyeos-extension-is-installed',
		'PRESENCE_SERVICE_URL': '/relay/presence/v1/userEvent/ping',
		'PRESENCE_PING_INTERVAL': 30000, // milliseconds
		'WINDOW_MANAGER_STRATEGY': 'auto', // ventus|popup|auto
		'DESKTOP_MODE_RECOVER_WINDOW': false,
		'POPUP_WINDOW_TOPBAR_ACTIVE': true,
		'DETACH_WINDOW_ACTIVE': true,
		'WINDOW_RESIZE_READY_MAX_RETRIES': 2, // Native Popup maximum retries to check values integrity
		'WINDOW_OFFSET_DETECTOR_MOVETO_MAX_RETRIES': 5,
		'WINDOW_OFFSET_DETECTOR_WAITFOR_MAX_RETRIES': 10,
		'POPUP_WINDOW_RESIZED_RETRIES': 5,
		'POPUP_WINDOW_CLOSED_DETECT_RETRIES': 5,
		'POPUP_WINDOW_DEBUG_LOG': false,
		'SEAMLESS_DESKTOP_INTEGRATION': true,
		'FEEDBACK_ACTIVE': true,
		'FAQ_ACTIVE': true,
		'FORUM_ACTIVE': true,
		'BLOG_ACTIVE': true,
		'VDI_FOCUS_INTEGRATION': false,
		'CHANGE_PASSWORD_ACTIVE': true,
		'SHOW_VIDEOCONFERENCE': true,
		'ENABLE_USER_SEARCH': true,
		'SUSPENDED_MAX_TIME_AWAY': 60000, //milliseconds
		'CHECK_SUSPENDED_INTERVAL': 5000, //milliseconds
		'CHECK_ACTIVITY_INTERVAL': 600000, //milliseconds
		'EYEOS_DISABLE_ANALYTICS': false,
		'URL_SUPPORT': "http://support.open365.io/index.php/",
		'URL_FORUM': "/forum",
		'URL_ABOUT': "http://open365.io",
		'URL_BLOG': "http://blog.open365.io",
		'LOCALIZATION_DOWNLOAD_CLIENT_ACTIVE': false,
		'URL_DOWNLOAD_CLIENT': "https://open365.io/download.html"
	});

	return settings;
});
