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
define(['vdi/eyeosVdiReconnectionService'], function () {
    angular.module('userActivity', [])
    .controller('userActivityController', [
        '$scope',
        '$translate',
        'eyeosVdiReconnectionService',
        function ($scope, $translate, eyeosVdiReconnectionService) {
            $scope.showDialog = false;
            $scope.titleMessage = $translate.instant('Hmmm! Are you awake?');
            $scope.subTitleMessage = $translate.instant('Maybe we should close this to protect your privacy.');

            DesktopBus.subscribe('vdiActivityLost', function () {
                $scope.messageTimeout = setTimeout(function(){
                    console.log('closing spice connection');
                    eyeosVdiReconnectionService.dispose();
                    DesktopBus.dispatch('vdiNoActivity');
                    $scope.showDialog = false;
                }, 60000);
                $scope.showDialog = true;
            });

            $scope.showDialog = false;
            $scope.messageTimeout = null;
            $scope.hideCheckActivityDialog  = function () {
                $scope.showDialog = false;
            };
            $scope.submit = function () {
                DesktopBus.dispatch('vdiResetActivity');
                $scope.showDialog = false;
                clearTimeout($scope.messageTimeout);
            };
    }]);
});