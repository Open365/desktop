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
define(['modules/changePassword/changePassword','settings'
    ],
    function(changepass, settings) {
        suite('Controller: changePasswordController', function(){
            var scope,
                $httpBackend,$controller,createController;
            var clock;
            var PRINCIPAL_URL_QUERY = settings.PRINCIPAL_SERVICE_URL + '/principals/me?no_cache=0';
            var CHANGE_PASSWORD_URL = settings.PRINCIPAL_SERVICE_URL + '/changepassword';



            setup(function() {
                module('changePassword');
                clock = sinon.useFakeTimers();

                inject(function ($injector ) {
                    scope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');

                    $httpBackend = $injector.get('$httpBackend');
                    scope.settings = settings;
                    scope.passData = { password : ''};

                    createController = function() {
                        return $controller('changePasswordController', {'$scope' : scope });
                    };
                });

                localStorage.card = '{ "username" : "eyeos"}';

            });

            teardown(function () {
                clock.restore();
            });


            test('If principal says that user has mustChangePassword, showDialog should be true', function() {
                $httpBackend.when('GET', PRINCIPAL_URL_QUERY ).respond(200, {mustChangePassword: true});

                $httpBackend.expectGET(PRINCIPAL_URL_QUERY );
                var controller = createController();
                $httpBackend.flush();
                assert.equal(scope.showDialog, true);
                assert.equal(scope.passwordSuccessMessage, false);
            });

            test('If principal says that user has NOT mustChangePassword, showDialog should be false', function() {
                $httpBackend.when('GET', PRINCIPAL_URL_QUERY ).respond(200, {});
                $httpBackend.expectGET(PRINCIPAL_URL_QUERY );
                var controller = createController();
                $httpBackend.flush();
                assert.equal(scope.showDialog, false);
                assert.equal(scope.passwordSuccessMessage, false);
            });

            test('verify the password has a minimum length', sinon.test(function(){
                createController();
                scope.passData.password = 'AaaDa325';
                var result = scope.verifyPasswdMinLength(8);
                assert.equal(result, true);
                scope.passData.password = 'AaaDa';
                result = scope.verifyPasswdMinLength(8);
                assert.equal(result, false);
            }));

            test('verify the password is different from the username', sinon.test(function(){
                localStorage.card = '{ "username": "eyeos" }';
                createController();
                scope.passData.password = 'eyeos';
                var result = scope.verifyUserName();
                assert.equal(result, false);
            }));


            function changePasswordSuccessfully () {
                $httpBackend.when('GET', PRINCIPAL_URL_QUERY ).respond(200, [{mustChangePassword: true}]);

                $httpBackend.when('PUT', scope.settings.PRINCIPAL_SERVICE_URL + '/changepassword' )
                    .respond(200,{});

                $httpBackend.expectGET(PRINCIPAL_URL_QUERY);
                $httpBackend.expectPUT(CHANGE_PASSWORD_URL);
                createController();
                scope.passData.password = scope.passData.password_c = 'A12345678a';
                scope.passData.passwordold = 'aaa';
                scope.submit();
                $httpBackend.flush();
            }

            test('If changePassword API is succesfull showDialog is set to false', sinon.test(function(){
                changePasswordSuccessfully();
                assert.equal(scope.passwordSuccessMessage, true);
            }));

            test('If changePassword API is succesfull desktopBus sends a changePasswordSuccess event ', sinon.test(function(){
                var desktopBusStub = sinon.stub(DesktopBus, 'dispatch');
                changePasswordSuccessfully();
                sinon.assert.calledWithExactly(desktopBusStub, 'changePasswordSuccess');
                desktopBusStub.restore();
            }));

            test('If changePassword API returns 401 showDialog remains true and errorOldPassword is set to true', sinon.test(function(){
                $httpBackend.when('GET', PRINCIPAL_URL_QUERY).respond(200, {mustChangePassword: true});
                $httpBackend.when('PUT', CHANGE_PASSWORD_URL ).respond(401,{});

                $httpBackend.expectGET(PRINCIPAL_URL_QUERY);
                $httpBackend.expectPUT(CHANGE_PASSWORD_URL);
                createController();
                scope.passData.password = scope.passData.password_c = 'A12345678a';
                scope.passData.passwordold = 'aaa';
                scope.submit();
                $httpBackend.flush();

                assert.equal(scope.showDialog, true);
                assert.equal(scope.errorOldPassword, true);
                assert.equal(scope.passwordSuccessMessage, false);
            }));

            test('If changePassword API returns a server error showDialog remains true and errorServer is set to true', sinon.test(function(){
                $httpBackend.when('GET', PRINCIPAL_URL_QUERY ).respond(200, {mustChangePassword: true});

                $httpBackend.when('PUT', CHANGE_PASSWORD_URL ).respond(501,{});

                $httpBackend.expectGET(PRINCIPAL_URL_QUERY);
                $httpBackend.expectPUT(CHANGE_PASSWORD_URL);
                createController();
                scope.passData.password = scope.passData.password_c = 'A12345678a';
                scope.passData.passwordold = 'aaa';
                scope.submit();
                $httpBackend.flush();

                assert.equal(scope.showDialog, true);
                assert.equal(scope.passwordSuccessMessage, false);
                assert.equal(scope.errorServer, true);
            }));

            });

    });
