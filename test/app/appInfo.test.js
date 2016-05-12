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
	'app/appInfo',
	'utils/TemplateCompiler'
], function (AppInfo, TemplateCompiler) {
	suite('appInfo.test suite', function () {
		var sut,
			fakeScope,
			templateCompiler,
			newTemplatePath;

		setup(function () {
			templateCompiler = new TemplateCompiler({}, {});
			newTemplatePath = 'anewTemplatePath';
			fakeScope = {
				hooks: {
					'aNewTemplateName': newTemplatePath
				}
			};
			sut = new AppInfo('aId','aName', 'aDescr', 'aType', templateCompiler);
			sut.setTplPath('aTplPath');
			sut.setTplScope(fakeScope);
		});


		suite('#replaceTemplate', function () {
			var templateName, eyeWindow;
			setup(function () {
				templateName = 'aNewTemplateName';
				eyeWindow = {
					replaceContent: function () {}
				}
			});

			function exercise () {
				return sut.replaceTemplate(templateName, function (){});
			}

			test('should set the new template as property', sinon.test(function(){
				sinon.stub(templateCompiler, 'compile');
			    exercise();
				assert.equal(sut.getTplPath(), newTemplatePath)
			}));

			test('should call templateCompile.compile with correct params', sinon.test(function () {
				var templateCompilerCompileStub = sinon.stub(templateCompiler, 'compile');

				exercise();
				sinon.assert.calledWithExactly(templateCompilerCompileStub, newTemplatePath, fakeScope, sinon.match.func);
			}));

			suite('when template compiler finishes', function(){
				var fakeDomElem;
				setup(function () {
					fakeDomElem = 'myDomElement';
				});
				function executeCompileCallback(fakeDomElem) {
					sinon.stub(templateCompiler, 'compile').callsArgWith(2, fakeDomElem);
				}

				test('should call replace window', sinon.test(function(){
				    executeCompileCallback(fakeDomElem);
				    sut.setEyeWindow(eyeWindow);
				    var windowReplaceContentStub = sinon.stub(sut.eyeWindow, 'replaceContent');
				    exercise();
				    sinon.assert.calledWithExactly(windowReplaceContentStub, $(fakeDomElem));
			    }));
			});

		});

	});

});
