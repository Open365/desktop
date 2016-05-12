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
	return function StartMenuController($scope, logoutHandler, SETTINGS, $window) {

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
			$window.open(settings.URL_FAQ, '_blank');
		};

		$scope.forum = function() {
			$window.open(settings.URL_FORUM, '_blank');
		};
		$scope.openChangePasswordDialog = function() {
			DesktopBus.dispatch('openChangePasswordDialog', { allowClose: true, titleMessage : "Change password", mainMessage: ""});
		};

		$scope.about = function() {
			$window.open(settings.URL_ABOUT, '_blank');
		};

		$scope.blog = function() {
			$window.open(settings.URL_BLOG, '_blank');
		};

	};
});