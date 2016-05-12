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
define(['settings', 'modules/open365Loading/open365Loading'], function (settings, open365LoadingController) {
	angular.module('open365Loading', [])
		.controller('open365LoadingController', ['$scope', '$translate', '$interval', function ($scope, $translate, $interval) {

			var messages = [
				'Please wait. We\'re loading your application.',
		        'Locating the required gigapixels to render...',
		        'The bits are breeding.',
		        'We\'re building the buildings as fast as we can.',
		        'Pay no attention to the man behind the curtain.',
		        'Enjoy the elevator music.',
		        'The little elves are drawing your map.',
		        'A few bits tried to escape, but we caught them.',
		        'Please wait, and dream of faster computers.',
		        'Checking the gravitational constant in your locale.',
		        'Hum something loud while others stare.',
		        'The server is powered by a lemon and two electrodes.',
		        'Please wait, we love you just the way you are.',
		        'We\'re testing your patience.',
		        'Wait, as if you had any other choice.',
		        'Take a moment to sign up for our lovely prizes.',
		        'Don\'t think of purple hippos.',
		        'Following the white rabbit.',
		        'Patience, why don\'t you order a sandwich?',
		        'Moving the satellite into position.',
		        'The bits are flowing slowly today.',
		        'Dig on the \'X\' for buried treasure... ARRR!',
		        'It\'s still faster than you could draw it.'
		    ];
			var i = 0;
			var previous = 0;
			var current = 0;

			$scope.loadingMessage = messages[0];

			$interval(function(){
			    while ( current === previous ) {
			        current = random(2, (messages.length));
			    }
			    previous = current;
		    	var translated = $translate.instant(messages[current - 1]);		    	
			    $("#message-item").fadeOut(500, function() {
			 		$scope.$apply(function(){
						$scope.loadingMessage = translated;
			 		});			        
			    }).fadeIn(500);

			}, 4000);

			function random(a,b) {
				return Math.floor((Math.random() * b) + a);
			}

		}]);
});