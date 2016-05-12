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

define(['settings'], function(settings) {
	function EyeosTranslationService () {
	}
	EyeosTranslationService.prototype.getUserLanguage = function ()  {
        var url = window.location.href;
        var regex = new RegExp("[\\?&]" + "userInfo" + "=([^&]*)");
        if(regex.exec(url)){
            var userInfo = regex.exec(url)[1];
            localStorage.setItem('userInfo', decodeURIComponent(userInfo));
        }

		var userInfoStringified = localStorage.getItem('userInfo');
		var userInfo = JSON.parse(userInfoStringified);

		var defaultUserLang = userInfo && userInfo.lang ? userInfo.lang : settings.FALLBACK_PLATFORM_LANG;
		return defaultUserLang;
	};
	return EyeosTranslationService;

});