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
	'app/appInfo'
], function (AppInfo) {

	suite('Service: ApplicationsService', function(){
		var httpBackend, ApplicationsService;
		var fakeApps, appData1, appData2;
		var sut;
		var clock;
		var APPLICATION_ENDPOINT = '/application/v1/applications?no_cache=0';

		setup(function() {
			// load the controller's module
			module('eyeApplications');
			clock = sinon.useFakeTimers();

			inject(function($httpBackend, _ApplicationsService_) {
				sut = ApplicationsService = _ApplicationsService_;
				httpBackend = $httpBackend;
			});

			appData1 = {"bigIcon":"http://www.w3.org/Graphics/PNG/alphatest.png","smallIcon":"https://www.google.es/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&cad=rja&uact=8&docid=tZng-t-fdkD9vM&tbnid=sIJbAnIeS3jT5M:&ved=0CAUQjRw&url=http%3A%2F%2Fprattspub.com%2FTEST%2Flearning%2Fimages%2Fcorrect%2F&ei=gK22U5hL44DLA7GegoAC&bvm=bv.70138588,d.d2k&psig=AFQjCNGxFI8OITPlqBVY-fo14BOLh_yoxA&ust=1404567294397870","name":"app1","tooltip":"tooltipapp1","description":"description1","url":"http://ap1.com","_id":"53b6ae0609cd59094ca0309f", "multipleInstances": true};
			appData2 = {"bigIcon":"http://www.w3.org/Graphics/PNG/alphatest.png","smallIcon":"http://4.bp.blogspot.com/-uNP12FtkL3A/T0mpj3mgKkI/AAAAAAAAAGU/ov20hi6R5oE/s1600/rotatetrans.png","name":"app2","tooltip":"tooltipapp2","description":"description2","url":"http://ap2.com","_id":"53b6af32e1f25a304d7d1aee", "multipleInstances": true};
			fakeApps = [appData1, appData2];
		});

		teardown(function() {
			httpBackend.verifyNoOutstandingExpectation();
			httpBackend.verifyNoOutstandingRequest();
			clock.restore();
		});

		function configureGetHeadersAsStub(context) {
			context.stub(eyeosAuthClient, "getHeaders", function() {
				return {
					card: "a card",
					signature: "a signature"
				};
			});
		}

		test('get when called makes a GET request to the correct url', sinon.test(function () {
			httpBackend.expectGET(APPLICATION_ENDPOINT).respond({});
			configureGetHeadersAsStub(this);
			ApplicationsService.getAllApplications();
			httpBackend.flush();
		}));


		test('get when called returns the response of the GET call', sinon.test(function () {
			var fakeAppInfo = [constructAppInfoFromAppData(appData1), constructAppInfoFromAppData(appData2)];
			httpBackend.whenGET(APPLICATION_ENDPOINT).respond(fakeApps);
			configureGetHeadersAsStub(this);
			var returnedPromise = ApplicationsService.getAllApplications();
			var result;
			returnedPromise.then(function(response) {
				result = response;
			});
			httpBackend.flush();
			assert.deepEqual(result, fakeAppInfo);
		}));

		test('when called getAllApplications twice should not double the number of applications', sinon.test(function(){
			httpBackend.whenGET(APPLICATION_ENDPOINT).respond(fakeApps);
			ApplicationsService.getAllApplications();
			var returnedPromise = ApplicationsService.getAllApplications();
			var result;
			returnedPromise.then(function(response) {
				result = response;
			});
			httpBackend.flush();
			assert.equal(result.length, 2);

		}));

		function constructAppInfoFromAppData (appData) {
			var appInfo = new AppInfo(appData.appID, appData.name, appData.description, appData.type);
			appInfo.setIsVdi(appData.isVdi);
			appInfo.setSettings(appData.settings);
			appInfo.setShowInDesktop(appData.showInDesktop);
			appInfo.setShowInTab(appData.showInTab);
			appInfo.setBigIcon(appData.bigIcon);
			appInfo.setSmallIcon(appData.smallIcon);
			appInfo.setTooltip(appData.tooltip);
			appInfo.setType(appData.type);
			appInfo.setUrl(appData.url);
			appInfo.setMultipleInstances(true);
			return appInfo;
		}

		suite("#getApplications", function () {
		    test("calls callback with the stored data", function (done) {
				var data = [1,2,3];
				sut._apps = data;
		        sut.getApplications(function (result) {
					done();
					assert.deepEqual(data, result)
				});
		    });

			test("calls getAllApplications when there is no stored data", function  () {
				var fakePromise = {
					then: function () {}
				};
				sinon.stub(sut, 'getAllApplications').returns(fakePromise);
			    sut.getApplications();
				sinon.assert.calledOnce(sut.getAllApplications);
			});
		});

		suite("#getApplicationByName", function () {
			test("returns the application data", function () {
				var name = 'fakeName';
				var expected = {
					name: name
				};

				var other = {
					name: 'foo'
				};

				sut._apps = [other, expected, other];

				var actual = null;

				sut.getApplicationByName(name, function (app) {
					actual = app;
				});

				assert.equal(actual, expected);
			});
		});
	});
});

