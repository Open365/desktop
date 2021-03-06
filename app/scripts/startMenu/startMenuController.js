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

"use strict";
define([
	'settings'
], function(settings) {
	return function StartMenuController($scope, logoutHandler, SETTINGS, $window, eyeosTranslation) {

		$scope.feedbackActive = settings.FEEDBACK_ACTIVE;
		$scope.faqActive = settings.FAQ_ACTIVE;
		$scope.forumActive = settings.FORUM_ACTIVE;
		$scope.blogActive = settings.BLOG_ACTIVE;
		$scope.changePasswordActive = settings.CHANGE_PASSWORD_ACTIVE;

		// UltraHack!!!!
		if (settings.EYETHEME_NAME === 'eyeos-cloud-app') {
			$scope.changePasswordActive = false;
		}


		$scope.logout = function () {
			logoutHandler.performLogout(eyeosAuthClient, SETTINGS, $window);
		};

		$scope.feedback = function() {
			$window.eyeosIgnoreConfirmation = true;
			$window.location.href = "mailto:feedback@eyeos.com?subject=[" + settings.EYEOS_NAME + "] Feedback";
			setTimeout(function (){
				$window.eyeosIgnoreConfirmation = false;
			}, 0);
		};

		$scope.faq = function() {
			$window.open($scope.getUrlSupport(), '_blank');
		};

		$scope.forum = function() {
			$window.open($scope.getUrlSupport('forum'), '_blank');
		};
		$scope.openChangePasswordDialog = function() {
			DesktopBus.dispatch('openChangePasswordDialog', { allowClose: true, titleMessage : "Change password", mainMessage: ""});
		};

		$scope.about = function() {
			$window.open($scope.getUrlAbout(), '_blank');
		};

		$scope.blog = function() {
			$window.open(settings.URL_BLOG, '_blank');
		};

		$scope.getUserLanguage = function() {
			var userLanguage = eyeosTranslation.getUserLanguage();
			if (userLanguage !== 'es') {
				userLanguage = 'en';
			}
			return userLanguage;
		};

		$scope.getUrlAbout = function() {
			var userLanguage = $scope.getUserLanguage();
			var url = settings.URL_ABOUT;
			if (userLanguage !== 'en') {
				url += "/" + userLanguage + "/index.html";
			}
			return url;
		}

		$scope.getUrlSupport = function(type) {
			var userLanguage = $scope.getUserLanguage();
			var url = settings.URL_SUPPORT + userLanguage;
			var map = {
				"forum": url + settings.URL_FORUM,
				"default": url
			};
			var result = map[type];
			if (!result) {
				result = map['default'];
			}
			return result;
		}
	};
});