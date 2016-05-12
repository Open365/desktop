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
define([], function () {
	function Content(el, width, height) {
		this.el = el;
		this._width = width;
		this._height = height;
	}

	Content.prototype.width = function (width) {
		if(arguments.length > 0){
			if (width === undefined ) {
				console.error('Warning!. Setting undefined width in content');
			}
			this._width = width;
		}
		return this._width;
	};
	Content.prototype.height = function (height) {
		if(arguments.length > 0) {
			if (height === undefined ) {
				console.error('Warning!. Setting undefined height in content');
			}
			this._height = height;
		}
		return this._height;
	};

	return Content;
});
