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
		'windows/EyeCanvasWindow',
		'windows/EyeIframeWindow',
		'windows/EyeUrlWindow',
        'windows/EyeTemplateWindow'
	],
	function (EyeCanvasWindow, EyeIframeWindow, EyeUrlWindow, EyeTemplateWindow) {
		return function WindowTemplateFactory() {
			return {
				getWindow: function (url, appData) {
					var options = {
						maximized: false,
						disableContinuousResizeEvents: false,
						dontExecuteEventHandlers: false,
						hideContentOnExpose: false,
						needId: false,
						appData: appData
					};

					if (appData && appData.canvas) {
						return new EyeCanvasWindow(appData, options);
					} else if(appData && appData.type === 'external_application') {
						return new EyeUrlWindow(url, options);
					} else if (appData && appData.isTemplateWindow) {
                        return new EyeTemplateWindow(url, options);
                    } else{
						return new EyeIframeWindow(url, options);
					}
				}
			};
		};
	});

