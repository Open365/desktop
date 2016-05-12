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

var connection, prePings = [], onPongs = [], timeouts= [], timeout, connectionReady;

function initWebSocket() {

	connection = new WebSocket('wss://' + location.hostname + '/netMeasure');

	connection.onopen = function () {
		console.log("Ping websocket ready!");
		connectionReady = true;
		sendPing();
	};

	// Log errors
	connection.onerror = function (error) {
		console.error('Ping WebSocket Error ', error);
		resetConnection();
	};

	// Log messages from the server
	connection.onmessage = function (data) {
		clearTimeout(timeouts.shift());
		var onPong = onPongs.shift();
		if (onPong) {
			onPong();
		}
	};

	connection.onclose = function (e) {
		console.warn("Ping websocket connection closed!!!!!!!!");
		resetConnection();
	};
}

function resetConnection() {
	if (!connection) {
		return;
	}

	console.log("Ping websocket reconnecting");

	connection.close();
	connection.onclose = function () {};
	connection.onerror = function () {};
	connection.onmessage = function () {};

	connection = null;
	connectionReady = false;

	clearState();

	setTimeout(initWebSocket, 500);
}

function clearState () {
	prePings.length = 0;
	onPongs.length = 0;
	timeouts.forEach(function (timeout) {
		clearTimeout(timeout);
	});
	timeouts.length = 0;
}

function sendErrorResponse() {
	self.postMessage({
		error: 1
	});
}

function sendPing () {
	var prePing = prePings.shift();
	if (prePing) {
		prePing();
		connection.send('Ping');
	}
}

function doPing (prePing, onPong) {

	if (connectionReady) {

		timeouts.push(setTimeout(function () {
			console.log("Ping timeout reached.");
			sendErrorResponse();
			resetConnection();
		}, timeout));
		prePings.push(prePing);
		onPongs.push(onPong);
		sendPing();
	} else {
		sendErrorResponse();
	}
}

initWebSocket();
self.addEventListener('message', function (e) {
	timeout = e.data.timeout;

	setInterval(function () {
		var startTime;
		doPing(function () {
			startTime = Date.now();
		}, function () {
			self.postMessage({
				initTime: startTime,
				endTime: Date.now()
			});
		});
	}, e.data.time || 1000);

}, false);
