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
	'utils/desktopBus',
	'windows/busWindowManager',
	'settings',
	'windows/windowReopener'
], function(DesktopBus, BusWindowManager, settings, WindowReopener) {

	return function WindowDirective(wmFactory, windowTemplateFactory, $compile, windowListService, busWindowManager) {
		var eyeosBusWindowManager = busWindowManager || new BusWindowManager(DesktopBus, 'eyeosWM');
		var eyeWindowDirective = {
			replace: true,
			restrict: 'E',
			scope: {
				url: '@url',
				title: '@title',
				imgUrl: '@',
				onRemove: '&',
				settings: '=',
				appData: '=',
				type: '@'
			},
			compile: function(element, attrs) {
				return function(scope, element, attrs) {
					var wm = wmFactory.getWindowManager(scope);
					var delta = {
						width: 1,
						height: 42
					};

					try {
						delta = wm.getFrameDelta();
					} catch(e) {
						console.debug('Curent window manager doesnt support getting the delta, so hardcoding ventus values');
					}

					var windowTemplate = windowTemplateFactory.getWindow(scope.url, scope.appData);

					var contents = windowTemplate.getContents(element, $compile, scope);
					var width = windowTemplate.getWidth();
					var height = windowTemplate.getHeight();
					var position = windowTemplate.getPosition();

					var maximized = windowTemplate.options.maximized;
					var needId = windowTemplate.options.needId;
					var disableContinuousResizeEvents = windowTemplate.options.disableContinuousResizeEvents;
					var dontExecuteEventHandlers = windowTemplate.options.dontExecuteEventHandlers;
					var hideContentOnExpose = windowTemplate.options.hideContentOnExpose;
					var windowDetach = settings.DETACH_WINDOW_ACTIVE === true || settings.DETACH_WINDOW_ACTIVE === "true";


					var options = {
						className: scope.appData.className,
						title: scope.title,
						x: position.x,
						y: position.y,
						width: width + (delta.width * 2),
						height: height + delta.height,
						maximized: maximized,
						tiltAnimation: false,
						imageUrl: scope.imgUrl,
						minimize: false,
						disableContinuousResizeEvents: disableContinuousResizeEvents,
						dontExecuteEventHandlers: dontExecuteEventHandlers,
						hideContentOnExpose: hideContentOnExpose,
						detach: windowDetach,
						$scope: scope.$parent,
						$compile: $compile,
						appData: scope.appData
					};

					if (scope.settings && scope.settings.minSize) {
						options.minWidth = scope.settings.minSize.width;
						options.minHeight = scope.settings.minSize.height;
					}

					var window = wm.createWindow.fromElement(contents, options);

					if (needId) {
						contents.attr('windowid', window.id);
						eyeosBusWindowManager.add(window.id, window);
					}

					scope.appData.eyeWindow = window;

                    //chat application uses $scope.$emit('openApp') and needs to be notified through appData
                    if(scope.appData.notifyWindowReady) {
                        scope.appData.notifyWindowReady(window);
                    }

					var $content = window.$content || window.get$content();
					$content.height(contents.height());
					if(!window.displayMessage ){
						window.displayMessage = function (data) {
							var msgDiv = $('<div class="msg-area">' +
								'<div class="msg-text center-block">'+data.message +
								'<div class="loading-spinner center-block"></div>' +
								'</div></div>');
							this.$content.prepend(msgDiv);
						};
					}

					if(!window.removeMessage){
						window.removeMessage = function () {
							this.$content.find(".msg-area").remove();
						};
					}


					window.open();

					var winId = window.getId ? window.getId() : window.id;
					windowListService.addWindow(winId, window);

					var windowReopener = new WindowReopener();
					window.signals.on('detach', function (win) {
						windowReopener.reopenInPopup(win, scope, windowTemplate.constructor.className, contents);
					});

					window.signals.on('attach', function (win) {
						windowReopener.reopenInVentus(win, scope, windowTemplate.constructor.className, contents);
					});

					window.signals.on('resize', function(window) {
						var $content = window.$content || window.get$content();
						contents.width($content.width());
						contents.height($content.height());
					});

					window.signals.on('closeDone', function() {
						scope.onRemove();
						scope.$destroy();
					});

					window.signals.on('blur', function (){
						contents.blur();
					});

					window.signals.on('close', function() {
						if(contents.prop('tagName') === "IFRAME") {
							contents.contents().unbind('mousedown');
							contents.attr('src',"about:blank");
						}
					});

					contents.load(function(){
						if(contents.prop('tagName') === "IFRAME" && contents.attr('src') !== 'about:blank') {
							contents.contents().mousedown(function(e){
								if (window.el && window.el.trigger) {
									window.el.trigger(e);
								}
							});
						}
					});
				};
			}
		};

		return eyeWindowDirective;
	};
});

