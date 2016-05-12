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
	'desktop/loading/loadingService',
	'windows/windowInfo/windowInfoFactory',
	'app/appInfo'
], function (LoadingService, WindowInfoFactory, AppInfo) {

	suite("LoadingService", function () {
		var sut,
			windowInfoFactory,
			fakeLoadingApp, fakeLoadingApp1, fakeLoadingApp2;

		setup(function () {
			windowInfoFactory = new WindowInfoFactory();
			sut = new LoadingService(windowInfoFactory);
			fakeLoadingApp = createFakeLoadingAppInfo();
		});

		teardown(function () {

		});

		suite("#openLoading", function () {
			var newScope, tplPath;

			function exercise(newScope, tplPath) {
				return sut.openLoading(newScope, tplPath);
			}

			setup(function () {
				newScope = 'aScope';
				tplPath = 'aTplPath';
			});


			test("should call to windowInfoFactory.getLoadingInfo", function () {
				windowInfoFactory.getLoadingInfo = sinon.stub().returns({setOpenType: function(){}});
				exercise(newScope, tplPath);
				assert(windowInfoFactory.getLoadingInfo.calledWithExactly(newScope, tplPath));
			});

			test("should add a loadingInfo to its loadings collection", function () {
				windowInfoFactory.getLoadingInfo = sinon.stub().returns(fakeLoadingApp);
				exercise(newScope, tplPath);
				assert.deepEqual(sut.loadings[0], fakeLoadingApp);
			});

		});

		suite('#closeLoading', function(){
		    test('should remove an element from the loadings collection', sinon.test(function(){
		        sut.loadings.push({});
			    sut.removeLoading();
			    assert.equal(sut.loadings.length, 0);
		    }));
		});

		suite('#removeLoading', function(){
		    test('should get one of the elements of the array and close that window', sinon.test(function(){
		        fakeLoadingApp.eyeWindow = createFakeEyeWindow();
			    sut.loadings.push(createFakeLoadingAppInfo());
		        sut.loadings.push(fakeLoadingApp);
			    sut.closeLoading();
			    assert(fakeLoadingApp.eyeWindow.close.calledWithExactly());
		    }));
		});

		suite('#reopenLoading', function(){
		    test('should open a loading with the passed info', sinon.test(function(){
			    sut.reopenLoading(fakeLoadingApp);
			    assert.equal(sut.loadings[0], fakeLoadingApp);
		    }));
		});

		suite('#getLastLoading', function(){

			test('should return the last loading', sinon.test(function(){
				prepareSutWithFakeLoadingApps();
				var actual = sut.getLastLoading();
				assert.equal(actual, fakeLoadingApp);
			}));

			test('when there are no loadings left should return undefined', sinon.test(function(){
				var actual = sut.getLastLoading();
				assert.strictEqual(actual, undefined);
			}));

		});


		suite('#replaceLastLoadingAppTemplate', function(){

			setup(function () {
				prepareSutWithFakeLoadingApps();
			});

			function exercise (){
				var templateKey = 'vdiConnectionError';
				return sut.replaceLastLoadingAppTemplate(templateKey);
			}

			test('should call replaceTemplate in last loadingApp', sinon.test(function(){

				var loadingAppReplaceTemplateStub = sinon.stub(fakeLoadingApp, 'replaceTemplate');
				exercise();
				sinon.assert.calledOnce(loadingAppReplaceTemplateStub);
				sinon.assert.calledWithExactly(loadingAppReplaceTemplateStub, 'vdiConnectionError', sinon.match.func);
			}));

			test('should call loadingService removeLoading', sinon.test(function(){
				var removeLoadingStub = sinon.stub(sut, 'removeLoading');
				sinon.stub(fakeLoadingApp, 'replaceTemplate').callsArgWith(1);
				exercise();
				sinon.assert.calledWithExactly(removeLoadingStub);
			}));

			test('when there are not any loading should not call replace template', sinon.test(function(){
				sinon.stub(sut, 'getLastLoading').returns(undefined);
				try {
					exercise();
				} catch (e) {
					if(e.name === 'TypeError') {
						assert.equal(true, false, 'replace template is being called')
					}
				}
			}));
		});

		function createFakeLoadingAppInfo(name) {
			var name = name || 'Loading';
			var appInfo = new AppInfo(name, 'Files', 'eyeos_application', 'fakeTpl', {});
			appInfo.setBigIcon("appIcons/bigIcons/eyeos-files.svg");
			appInfo.setSmallIcon("appIcons/smallIcons/eyeos-files.svg");
			appInfo.setTooltip("Files");
			appInfo.setSettings({
				minSize: {
					height: 150,
					width: 250
				}
			});
			appInfo.setIsLoading(true);
			return appInfo;
		}

		function createFakeEyeWindow () {
			return {
				close: sinon.stub()
			}
		}

		function prepareSutWithFakeLoadingApps() {
			fakeLoadingApp = createFakeLoadingAppInfo('fakeLoadingApp');
			fakeLoadingApp1 = createFakeLoadingAppInfo('fakeLoadingApp1');
			fakeLoadingApp2 = createFakeLoadingAppInfo('fakeLoadingApp2');
			sut.loadings.push(fakeLoadingApp1, fakeLoadingApp2, fakeLoadingApp);
		}
	});
});
