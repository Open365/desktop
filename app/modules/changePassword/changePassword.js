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
define(['settings'], function (settings) {
    angular.module('changePassword', []).controller('changePasswordController', ['$scope', '$http', function ($scope, $http) {

        var user = JSON.parse(localStorage.card).username;

        $scope.showDialog = false;
        $scope.passwordSuccessMessage = false;
        $scope.allowClose = false;
        $scope.titlemessage = "Just one last thing!";
        $scope.mainmessage = "For security reasons you need to change your password before you start using eyeOS. Use it in your next login!";

        $http.get($scope.settings.PRINCIPAL_SERVICE_URL + '/principals/me?no_cache=' + Date.now()).then(function (response) {
            if (response.data && response.data.mustChangePassword) {
                $scope.showDialog = true;
                $scope.passwordSuccessMessage = false;
            }
        }, function (error) {
            console.error("Error retrieving user information.", error);
        });

        $scope.showChangePasswordDialog  = function (data) {
            if (data.allowClose === true) {
                $scope.allowClose = true;
            }
            if (data.titleMessage) {
                $scope.titlemessage = data.titleMessage;
            }
            if (data.mainMessage !== undefined) {
                $scope.mainmessage = data.mainMessage;
            }

            $scope.passData.password = "";
            $scope.passData.passwordold = "";
            $scope.passData.password_c = "";

            $scope.showDialog = true;
            $scope.passwordSuccessMessage = false;

        };

        $scope.hideChangePasswordDialog  = function () {
            $scope.passwordSuccessMessage = false;
            $scope.showDialog = false;
        };

        $scope.passData = {};
        $scope.verifyPasswdMinLength = function (min) {
            return !!($scope.passData.password && $scope.passData.password.length >= min);
        };
        $scope.verifyUserName = function () {
            return !!($scope.passData.password && $scope.passData.password !== user);
        };

        $scope.removeOldPassError = function () {
            $scope.errorOldPassword = false;
        };

        DesktopBus.subscribe('openChangePasswordDialog', function (data) {
            $scope.showChangePasswordDialog(data);
        });


        $scope.canSend = function() {
            return (this.verifyPasswdMinLength(8) &&
                    this.verifyUserName() &&
                    $scope.passData.passwordold.length &&
                ($scope.passData.password === $scope.passData.password_c));
        };

        $scope.submit = function () {
            if (!$scope.canSend()) {
                return;
            }

            var dataObject = {
                currentpass: $scope.passData.passwordold,
                newpass: $scope.passData.password
            };

            $scope.errorOldPassword = false;
            $scope.errorServer = false;

            var result = $http.put(this.settings.PRINCIPAL_SERVICE_URL+ "/changepassword", dataObject, {});
            result.success(function(data, status, headers, config) {
                $scope.passwordSuccessMessage = true;
                $scope.allowClose = true;
                DesktopBus.dispatch('changePasswordSuccess');
            });
            result.error(function(data, status, headers, config) {
                switch(status) {
                    case 401:
                        $scope.errorOldPassword = true;
                        break;
                    default:
                        $scope.errorServer = true;
                        break;
                }
            });

        };

    }]);
});

