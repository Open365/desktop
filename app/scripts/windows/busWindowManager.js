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

define(function() {
	function BusWindowManager (bus, channel) {
		this.wins = {};

		this.bus = bus;
		this.channel = channel;
		this.listenToBus();
	}

	BusWindowManager.prototype.add = function (id, win) {
		win.id = id;
		this.wins[id] = win;
		this.addListenersToWindow(id, win);
	};

	BusWindowManager.prototype.get = function (id) {
		return this.wins[id];
	};

	BusWindowManager.prototype.listenToBus = function () {

		var self = this;

		this._listenCallback = function (data, ev) {
			var topic = ev.topic;
			var winEvent = topic.replace(self.channel + '.', '');

			self.performAction(winEvent, data);
		};

		this.bus.subscribe(this.channel + '.*', this._listenCallback);
	};

	BusWindowManager.prototype.performAction = function (action, data) {
		if(data && data.id){
			var win = this.get(data.id);
			if(win){
				this.performWindowAction(win, action, data);
			}
		}else{
			this.broadcastAction(action, data);
		}
	};

	BusWindowManager.prototype.broadcastAction = function (action, data) {
		for(var winId in this.wins) {
			this.performWindowAction(this.wins[winId], action, data);
		}
	};

	BusWindowManager.prototype.performWindowAction = function (win, action, data) {
		switch (action) {
			case 'windowClose':
				if(data && data.existing && typeof win.closeSilent === 'function') {
					win.closeSilent();
				} else {
					win.close();
				}
				delete this.wins[win.id];
				break;
			case 'windowMove':
				win.move(+data.left, +data.top);
				break;
			case 'windowResize':
				win.resizeContent(+data.width, parseInt(data.height));
				break;
			case 'windowMinimize':
				win.minimize();
				break;
			case 'windowMaximize':
				var clickedMaximized = (data.zoomed !==0);
				win.maximize(clickedMaximized);
				break;
			case 'windowFocus':
				win.focus();
				break;
			case 'windowRestore':
				console.log('Ignoring restore');
				break;
			case 'windowDisplayMessage':
				win.displayMessage(data);
				break;
			case 'windowRemoveMessage':
				win.removeMessage();
				break;
		}

		return true;
	};

	BusWindowManager.prototype.addListenersToWindow = function (id, win) {
		var bus = this.bus;
		var channel = this.channel;

		win.signals.on('close', function () {
			bus.dispatch(channel + ".windowClosed", {
				id: id
			});
		});

		win.signals.on('move', function () {
			var x = (win.x !== null && win.x !== undefined)? win.x : win.getX();
			var y = (win.y !== null && win.y !== undefined)? win.y :win.getY();
			bus.dispatch(channel + ".windowMoved", {
				id: id,
				x: x,
				y: y
			});
		});

		win.signals.on('resize', function () {
			var $content = win.$content || win.get$content();
			bus.dispatch(channel + ".windowResized", {
				id: id,
				width: $content.width(),
				height: $content.height()
			});

		});

		win.signals.on('maximize', function () {
			bus.dispatch(channel + ".windowMaximized", {
				id: id
			});
		});

		win.signals.on('minimize', function () {
			bus.dispatch(channel + ".windowMinimized", {
				id: id
			});
		});

		win.signals.on('focus', function () {
			bus.dispatch(channel + ".windowFocused", {
				id: id
			});
		});

		win.signals.on('blur', function () {
			bus.dispatch(channel + ".windowBlurred", {
				id: id
			});
		});

		win.signals.on('restore', function (win) {
			var $content = win.$content || win.get$content();
			bus.dispatch(channel + ".windowRestored", {
				id: id,
				width: $content.width(),
				height: $content.height()
			});
		});
	};
	return BusWindowManager;
});
