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
	'eyeosAuthClient',
	'desktop/desktopInitializerService',
	'modules/eyeApplications/eyeApplications',
	'startMenu/eyeStartMenuModule',
	'windows/eyeWindowsModule',
	'utils/modal/eyeAlert',
	'utils/utilsModule',
	'auth/eyeosDesktopAuthModule',
	'auth/eyeosDesktopAuthService',
	'bus/eyeosDesktopBusModule',
	'bus/eyeosDesktopBusService',
	'print/eyeosPrintModule',
	'vdi/eyeosVdiModule',
	'notify/eyeosFileWatcherModule',
	'translations/eyeosTranslationModule',
	'peopleGroups/peopleGroupsModule',
	'modules/eyeTheme/eyeTheme',
	'modules/suspension/suspension'
], function(eyeosAuthClient, DesktopInitializer) {
	/**
	 * @ngdoc overview
	 * @name eyeDesktopApp
	 * @description
	 * # eyeDesktopApp
	 *
	 * Main module of the application.
	 */

	var eyeThemeInfo = window.eyeThemeInfo;
	var modules = Object.keys(eyeThemeInfo.getModules() || {});
	var mainTpl = eyeThemeInfo.getHooks() && eyeThemeInfo.getHooks().main ? eyeThemeInfo.getHooks().main: 'themes/desktop/templates/desktop/desktop.tpl.html';
	angular
		.module('eyeDesktopApp', [
			'ngCookies',
			'ngResource',
			'ngRoute',
			'ngSanitize',
			'angular-blocks',
			'ui.bootstrap',
			'eyeStartMenu',
			'eyeWindows',
			'eyeApplications',
			'eyeosModal',
			'eyeosDesktopAuth',
			'eyeosDesktopBus',
			'eyeosPrint',
			'eyeosVdiModule',
			'eyeosFileWatcher',
			'eyeTheme',
			'eyeosTranslationModule',
			'peopleGroupsModule',
			'suspension',
			'utils'
		].concat(modules))
		.service('desktopInitializer',
		[
			'eyeosDesktopAuthService',
			'eyeosDesktopBusService',
			'suspensionDetector',
			'eyeosPrintService',
			'eyeosVdiInitializer',
			'eyeosFileWatcherService',
			DesktopInitializer
		])
		.config(['$routeProvider', function ($routeProvider) {
			$routeProvider
				.when('/', {
					templateUrl: mainTpl,
					controller: 'DesktopController',
					resolve: {
						authResultHandlerService: ['authResultHandlerService', function (authResultHandlerService) {
							return authResultHandlerService.setNewHeaders();
						}]
					}
				})
				.otherwise({
					redirectTo: '/'
				});
		}])

		.config(['$sceDelegateProvider', function($sceDelegateProvider) {
			$sceDelegateProvider.resourceUrlWhitelist([
				"self",
				"**"
			])
		}])
		.config(['$locationProvider', function($locationProvider) {
			$locationProvider.html5Mode(true);
		}])

		.run(['desktopInitializer', 'SETTINGS', function(desktopInitializer, settings) {
			desktopInitializer.setAuthClientLoaded(settings);
			desktopInitializer.handleComputerSuspension();
		}])
	;
	require(['desktop/desktopController'], function() {
		angular.bootstrap(document.documentElement, ['eyeDesktopApp']);
	});
});
