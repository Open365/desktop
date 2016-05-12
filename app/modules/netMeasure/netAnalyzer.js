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

define([], function () {
	function NetAnalyzer(settings) {
		this.historyLength = settings.LATENCY_HISTORY_SIZE;
		this.history = generateArray(this.historyLength, 0);
		this.pingsToTruncate = settings.LATENCY_PINGS_TO_TRUNCATE;
		this.scale = settings.LATENCY_SCALE;
		this.errorMutliplier = (this.scale.length + 1) / this.historyLength;
	}

	function generateArray(len, num) {
		var history = [];
		for (var i = 0; i < len; i++) {
			history[i] = num;
		}
		return history;
	}

	function sum(a, b) {
		return a + b;
	}

	function arrayAverage(arr) {
		return arr.reduce(sum, 0) / arr.length;
	}

	function calculateErrorPenalty(currData, errorMutliplier) {
		return currData.reduce(function (prev, item, pos) {
			if (item.error) {
				return prev + Math.ceil(errorMutliplier * (pos + 1));
			}

			return prev;
		}, 0);
	}

	function calculateAverage(currData, pingsToTruncate) {
		currData = currData.filter(function (item) {
			return !item.error
		});


		currData.sort(function (a, b) {
			return a - b;
		});

		for (var count = 0; count < pingsToTruncate; count++) {
			currData.shift();
			currData.pop();
		}

		return arrayAverage(currData);
	}

	function calculateScalePosition(scale, average, errorPenalty) {
		var i = 0;
		average = average / 2; //This is to analyze just one roundtrip and make it look like a real ping.
		while (scale[i++] > average) {
		}

		i -= errorPenalty;

		return i < 0 ? 0 : i;
	}

	NetAnalyzer.prototype.analyze = function (data) {
		this.history.shift();
		if (data.error) {
			this.history.push(data);
		} else {
			this.history.push(data.endTime - data.initTime);
		}

		var currData = this.history.slice();

		var errorPenalty = calculateErrorPenalty(currData, this.errorMutliplier);

		if (errorPenalty >= this.scale.length + 1) {
			return 0;
		}

		var average = calculateAverage(currData, this.pingsToTruncate);

		return calculateScalePosition(this.scale, average, errorPenalty);
	};
	
	return NetAnalyzer;
});
