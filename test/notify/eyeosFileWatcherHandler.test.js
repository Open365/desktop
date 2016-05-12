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
	'utils/desktopBus',
	'notify/eyeosFileWatcherHandler'
], function(DesktopBus, eyeosFileWatcherHandler) {
	var sut;

	suite('Service: eyeosFileWatcherHandler', function () {
		setup(function () {
			sut = new eyeosFileWatcherHandler();
		});

		var TestCases = [
			{
				data: [{ data: '[{ "path": "print:///fakeFile.txt", "event": "CREATE"}]', from: "system", name: "modified", type: "filesystem" }],
				dispatch: "printFile",
				expected: { path: "print:///fakeFile.txt", event: "CREATE" }
			},
			{
				data: [{ data: '[{ "path": "print:///fakeFile.txt", "event": "MOVED_TO"}]', from: "system", name: "modified", type: "filesystem" }],
				dispatch: "printFile",
				expected: { path: "print:///fakeFile.txt", event: "MOVED_TO" }
			},
			{
				data: [{ data: '[{ "path":"fake://fakeFile.txt", "event": "CREATE" }]', from: "system", name: "modified", type: "filesystem"  }],
				dispatch: "filesystemapp",
				expected: { data: [{ path:"fake://fakeFile.txt", event: "CREATE" }], from: "system", name: "modified", type: "filesystem"  }
			},
			{
				data: [{ data: '[{ "path": "print:///fakeFile.txt", "event": "DELETE"}]', from: "system", name: "modified", type: "filesystem" }],
				dispatch: "filesystemapp",
				expected: { data: [{ path:"print:///fakeFile.txt", event: "DELETE" }], from: "system", name: "modified", type: "filesystem"  }
			},
			{
				data: [{ data: '[{ "path": "print:///", "event": "CREATE"}]', from: "system", name: "modified", type: "filesystem" }],
				dispatch: "filesystemapp",
				expected: { data: [{ path:"print:///", event: "CREATE" }], from: "system", name: "modified", type: "filesystem"  }
			}
		];

		TestCases.forEach(function (info) {
			test('when receiving push.filesystem with ' + info.data[0].data + ' should dispatch ' + info.dispatch, sinon.test(function () {
				var data = info.data;
				this.mock(DesktopBus).expects('dispatch').once().withExactArgs(info.dispatch, info.expected);
				sut.onPushFileSystem(data);
			}));
		});

	});

});
