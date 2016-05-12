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
require([
    'bower/postal.js/lib/postal',
    'utils/desktopBus'
], function(Postal, DesktopBus) {
    suite('Controller: DesktopController', function(){
        var scope,
            fakeApp,
            fakeAlert,
            OpenAppsService,
            windowManagerService,
            applicationsService;

        setup(function() {
            // load the controller's module
            module('eyeDesktopApp');
            window.postal = Postal;

            // Initialize the controller and a mock scope
            inject(function ($injector, $controller, $rootScope, _OpenAppsService_) {
                scope = $rootScope.$new();
                OpenAppsService = _OpenAppsService_;
                windowManagerService = $injector.get('WindowManagerService');
                applicationsService = $injector.get('ApplicationsService');
                $controller('DesktopController', {
                    $scope: scope,
                    OpenAppsService: _OpenAppsService_,
                    WindowManagerService: windowManagerService,
                    ApplicationService: applicationsService
                });
            });

            fakeApp = {"bigIcon":"http://www.w3.org/Graphics/PNG/alphatest.png","smallIcon":"https://www.google.es/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&cad=rja&uact=8&docid=tZng-t-fdkD9vM&tbnid=sIJbAnIeS3jT5M:&ved=0CAUQjRw&url=http%3A%2F%2Fprattspub.com%2FTEST%2Flearning%2Fimages%2Fcorrect%2F&ei=gK22U5hL44DLA7GegoAC&bvm=bv.70138588,d.d2k&psig=AFQjCNGxFI8OITPlqBVY-fo14BOLh_yoxA&ust=1404567294397870","name":"app1","tooltip":"tooltipapp1","description":"description1","url":"http://ap1.com","_id":"53b6ae0609cd59094ca0309f"};
            fakeAlert = {
                title: "File/Folder Already Exists",
                msg: "The name \"testFile\" is already taken. Please choose a different name.",
                icon: "images/icons/alert.png",
                ok: function (ok) {}
            };
        });

		teardown(function () {
			scope.unsubscribe();
		});

        test("displayAlert event received and event is should create a new alert", function() {
            DesktopBus.dispatch("displayAlert", {"type":"NODE_EXISTS", "data":{"name":"testFile"}});
            //Guard assertion
            assert.equal(scope.alerts.length, 1);
            assert.equal(scope.alerts[0].title, fakeAlert.title);
            assert.equal(scope.alerts[0].msg, fakeAlert.msg);
            assert.equal(scope.alerts[0].icon, fakeAlert.icon);
        });

        test("openFileViewer event received should create a new viewer window", function() {
			DesktopBus.dispatch("openFileViewer", {"paths":['path1', 'path2'], name: 'aTitle'});
			var expectedData = [
				{ appID: 'Viewer', id: 0, "bigIcon": "/viewer/images/viewer.png", "smallIcon": "/viewer/images/viewer.png", "name": "Viewer - aTitle", "tooltip": "viewer", "description": "viewer application", "url": "/viewer/?file=%5B%22path1%22%2C%22path2%22%5D"}
			];
			assert.equal(scope.windows.length, expectedData.length);
            assert.equal(scope.windows[0].appID, expectedData[0].appID);
            assert.equal(scope.windows[0].bigIcon, expectedData[0].bigIcon);
			assert.equal(scope.windows[0].smallIcon, expectedData[0].smallIcon);
			assert.equal(scope.windows[0].name, expectedData[0].name);
			assert.equal(scope.windows[0].tooltip, expectedData[0].tooltip);
			assert.equal(scope.windows[0].description, expectedData[0].description);
			assert.equal(scope.windows[0].url, expectedData[0].url);
        });

        test("openFileViewerPopup event received should create a new viewer detached window", function () {
            DesktopBus.dispatch("openFileViewerPopup", {"paths": ['path1', 'path2'], name: 'aTitle'});
            var expectedData = [
                {
                    appID: 'Viewer',
                    id: 0,
                    "bigIcon": "/viewer/images/viewer.png",
                    "smallIcon": "/viewer/images/viewer.png",
                    "name": "Viewer - aTitle",
                    "tooltip": "viewer",
                    "description": "viewer application",
                    "url": "/viewer/?file=%5B%22path1%22%2C%22path2%22%5D",
                    "openType": "detached_application"
                }
            ];
            assert.equal(scope.windows.length, expectedData.length);
            assert.equal(scope.windows[0].appID, expectedData[0].appID);
            assert.equal(scope.windows[0].bigIcon, expectedData[0].bigIcon);
            assert.equal(scope.windows[0].smallIcon, expectedData[0].smallIcon);
            assert.equal(scope.windows[0].name, expectedData[0].name);
            assert.equal(scope.windows[0].tooltip, expectedData[0].tooltip);
            assert.equal(scope.windows[0].description, expectedData[0].description);
            assert.equal(scope.windows[0].url, expectedData[0].url);
            assert.equal(scope.windows[0].openType, expectedData[0].openType);
        });

        suite('receiving openAppDetached event', function () {
           test("calls openAppsService.openApp with an app with the detached type", function () {
               OpenAppsService.openApp = sinon.stub();
               scope.$emit('openAppDetached', angular.copy(fakeApp));

               fakeApp.openType = "detached_application";
               sinon.assert.calledWithExactly(OpenAppsService.openApp, fakeApp, sinon.match.func);

           });
        });

	    suite('receiving openApp event ', function(){
	        test('when called should create a new window', function () {
	            scope.$emit('openApp', fakeApp);
	            assert.deepEqual(scope.windows, [fakeApp]);
	        });

		    suite('when the app opened is not vdi', function(){
			    setup(function () {
				    OpenAppsService.isVDI = sinon.stub().returns(false);
			    });
			    test('should broadcast openLoading event in order to open a loading window', function () {
				    scope.$broadcast = sinon.stub();
		            scope.$emit('openApp', fakeApp);
		            assert(scope.$broadcast.neverCalledWith('openLoading', fakeApp));
		        });
		    });

	    });

        test('closeApp when called with an index should remove element from windows array', sinon.test(function () {
            this.mock(OpenAppsService)
                .expects('closeApp')
                .once()
                .calledWith(1);
            scope.closeApp(1);
        }));

        suite('unloadDesktop', function() {

            test('when called should call DesktopBus dispatch with unloadDesktop event', sinon.test(function() {
                this.mock(DesktopBus).expects('dispatch').once().withExactArgs('unloadDesktop');
                scope.unloadDesktop();
            }));
        });


	    suite('onDesktopResize', function () {

		    test('should call ventusWindowManager.onDesktopResized with new desktop sizes', sinon.test(function () {
			    var desktopWidth = 600,
				    desktopHeigth = 433;
			    var fakeVentusWM = createFakeVentusWM();
			    scope.onDesktopResize(desktopWidth, desktopHeigth);
			    assert(fakeVentusWM.onDesktopResized.calledWithExactly(desktopWidth, desktopHeigth));
		    }));
	    });

	    function createFakeVentusWM() {
		    var fakeVentusWM = {
			    onDesktopResized: sinon.stub()
		    };
		    sinon.stub(windowManagerService, 'getVentusManager').returns(fakeVentusWM);
		    return fakeVentusWM;
	    }

        suite('on desktopBus fileChooser.open event', function () {
            var applicationsServiceStub, id, BootstrapDialogStub;


            setup(function () {
                BootstrapDialogStub = sinon.stub(BootstrapDialog, 'show');
                id = "123123123";
                applicationsServiceStub = sinon.stub(applicationsService, 'getApplicationByName');
            });

            teardown(function () {
                BootstrapDialogStub.restore();
            });

            test("gets the files application info", function () {
                var id = "123123123";
                DesktopBus.dispatch("fileChooser.open", id);
                sinon.assert.calledWithExactly(applicationsServiceStub, 'Files', sinon.match.func);
            });

            test("opens a bootstrap dialog", function () {
                var appData = {
                    url: 'fakeUrl'
                };

                applicationsServiceStub.callsArgWith(1, appData);

                DesktopBus.dispatch("fileChooser.open", id);

                sinon.assert.calledOnce(BootstrapDialogStub);
            });

            test("closes the dialog on event from desktopBus", function () {
                var id = "321321321";
                var appData = {
                    url: 'fakeUrl'
                };

                applicationsServiceStub.callsArgWith(1, appData);

                var dialog = {
                    close: sinon.stub()
                };

                BootstrapDialogStub.returns(dialog);

                DesktopBus.dispatch("fileChooser.open", id);

                DesktopBus.dispatch("fileChooser.close." + id);

                sinon.assert.calledOnce(dialog.close);

            });
        });

    });
});
