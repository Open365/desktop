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
    'settings',
    'urlConfig',
    'modules/cloud/cloudFileOpenService',
    'modules/cloud/cloudTitleService',
    'modules/cloud/seahubWrapper',
    'modules/cloud/cloudTopbarController',
    'translations/eyeosTranslationModule',
    'utils/locationModule'
], function (settings, urlConfig, CloudFileOpenService, CloudTitleService, SeahubWrapper, CloudTopbarController) {
    var subscriptions = {};
    window.eyeosIgnoreConfirmation = true;

    angular.module('cloud', [
        'eyeosTranslationModule',
        'eyeosLocation'
    ])
        .service('cloudTitleService', [CloudTitleService])
        .service('cloudFileOpenService', [
            '$translate',
            'eyeosLocationService',
            'cloudTitleService',
            function ($translate, eyeosLocationService, cloudTitleService) {
                var cloudFileOpenService = new CloudFileOpenService($translate, eyeosLocationService, cloudTitleService);
                cloudFileOpenService.start();
                return cloudFileOpenService;
        }])
        .controller('topbarController', ['$scope', CloudTopbarController])
        .controller('cloudController', ['$scope', '$sce', 'cloudFileOpenService', 'cloudTitleService', '$window',
            function ($scope, $sce, cloudFileOpenService, cloudTitleService, $window) {
                var seahubWrapper = new SeahubWrapper();
                seahubWrapper.start();

                if($window.settingsStatic.EYEOS_DISABLE_ANALYTICS === false) {
                    ga('set', 'metric3', 1 );
                    ga('send', 'event', 'Desktop', 'Opened');
                    ga('send', 'pageview', document.location.pathname + '/desktop');
                }

                $scope.vdiVisible = false;
                $scope.vdiError = false;
                $scope.gotError = false;
                $scope.welcomeVisible = true;
                $scope.initialized = false;
                $scope.inVdi = false;
                $scope.showLoading = true;
                $scope.showErrorMessage = false;
                $scope.showLostActivity = false;
                $scope.iconSvg = 'open365-logo-home';

                cloudTitleService.setTitle();

                $scope.appName = $sce.trustAsResourceUrl("appviewer/?app=" + urlConfig.app);

                $scope.launchApp = cloudFileOpenService.launchApp;

                $scope.openMyHome = function () {
                    seahubWrapper.openMyHome();
                };

                $scope.openGroups = function () {
                    seahubWrapper.openGroups();
                };

                $scope.openOrg = function () {
                    seahubWrapper.openOrg();
                };

                $scope.recoverWorkSession = function() {
                    console.log('reloading....');
                    $window.eyeosIgnoreConfirmation = true;
                    $window.location.reload();
                    setTimeout(function (){
                        $window.eyeosIgnoreConfirmation = false;
                    }, 0);
                };

                seahubWrapper.login();

                subscriptions['changePasswordSuccess'] = window.DesktopBus.subscribe('changePasswordSuccess', function () {
                    $scope.showLoading = true;
                    $scope.$apply();
                });

                subscriptions['eyeosCloud.ready'] = window.DesktopBus.subscribe('eyeosCloud.ready', function () {
                    $scope.showLoading = false;
                    $scope.showErrorMessage = false;
                    $scope.showLostActivity = false;
                    $scope.$apply();
                });

                subscriptions['vdiconnect.error'] = window.DesktopBus.subscribe('vdiconnect.error', function () {
                    $scope.showErrorMessage = true;
                    $scope.showLostActivity = false;
                    $scope.$apply();
                });

                subscriptions['vdi.noactivity'] = window.DesktopBus.subscribe('vdiNoActivity', function () {
                    $scope.showErrorMessage = false;
                    $scope.showLostActivity = true;
                    $scope.$apply();
                });

                subscriptions['seahub.reload'] = window.DesktopBus.subscribe('seahub.reload', function () {
                    $scope.showLoading = true;
                    $scope.$apply();
                    window.setTimeout(function() {
                        seahubWrapper.reload();
                    }, 30000);
                });

                subscriptions['seahub.ready'] = window.DesktopBus.subscribe('seahub.ready', function () {
                    $scope.showLoading = false;
                    $scope.$apply();
                });

                $scope.$on('$destroy', function() {
                    subscriptions.forEach(function (sub) {
                        sub.unsubscribe();
                    });
                });

                seahubWrapper.setEnvironmentLocalStorage();
            }]);
});
