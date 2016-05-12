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
	'windows/windowReopener'
], function (WindowReopener) {
	suite("windowReopener", function () {
		var sut, fakeWin, fakeScope, fakeContent,
			openType;

		setup(function () {
			fakeWin = {
				close: sinon.stub()
			};

			fakeScope = {
				appData: {isLoading: false},
				onRemove: sinon.stub(),
				$emit: sinon.stub(),
				$apply: sinon.stub()
			};

			fakeContent = [{
				contentWindow: {location: {href: 'href'}}
			}];

			openType = 'fakeType';

			window.oldDesktopBus = window.DesktopBus;
			window.DesktopBus = sinon.stub(new FakeDesktopBus());

			sut = new WindowReopener();
		});

		teardown(function () {
			window.DesktopBus = window.oldDesktopBus;
		});

		suite("#reopenByType", function () {
			test("sets the app URL from the original content when windowTempateType is iframe", function () {
				exerciseReopenByType();
				assert.equal(fakeScope.appData.url, 'href', 'failed to set the correct app url');
			});

			suite('when is detaching a loading window', function(){
				setup(function () {
					fakeScope.appData.isLoading = true;
				});

				test('emits a reopenLoading signal with correct data', function(){
					exerciseReopenByType();
					sinon.assert.calledWithExactly(fakeScope.$emit, 'reopenLoading', fakeScope.appData);
				});
			});

			suite('when is detaching a regular app ', function(){
				test('removes the window from the scope', function () {
					exerciseReopenByType();
					sinon.assert.called(fakeScope.onRemove);
				});

				test('should emit openApp event with the app to open', sinon.test(function(){
					exerciseReopenByType();
					sinon.assert.calledWithExactly(fakeScope.$emit, 'openApp', fakeScope.appData);
				}));
			});

			suite('when reopening a vdi app', function(){
				setup(function () {
					fakeScope.appData.type = 'eyeos_vdi_application';
				});

			    test('should dispatch windowCreate event through bus with correct params', sinon.test(function(){
				    exerciseReopenByType('EyeCanvasWindow');
				    sinon.assert.calledWithExactly(DesktopBus.dispatch, 'windowCreate', fakeScope.appData);
			    }));

			});

			test('assigns the way the app will be opened', function () {
				exerciseReopenByType();
				assert.equal(fakeScope.appData.openType, openType);
			});

			test('closes the window when detached', function () {
				exerciseReopenByType();
				sinon.assert.called(fakeWin.close);
			});

			test('displays the window changes', function () {
				exerciseReopenByType();
				sinon.assert.called(fakeScope.$apply);
			});

			function exerciseReopenByType (windowTempateType) {
				windowTempateType = windowTempateType || 'EyeIframeWindow';
				sut.reopenByType('fakeType', fakeWin, fakeScope, windowTempateType, fakeContent);
			}
		});
	});
});
