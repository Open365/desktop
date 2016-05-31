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

// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2014-07-02 using
// generator-karma 0.8.2

module.exports = function (config) {
	config.set({
		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,

		// base path, that will be used to resolve files and exclude
		basePath: '../',

		// testing framework to use (jasmine/mocha/qunit/...)
		frameworks: ['requirejs','mocha', 'chai', 'sinon'],

		// list of files / patterns to load in the browser
		files: [
			'test/mocha.conf.js',
			{pattern:'test/fakeExternalDependenciesAmd/fakeDesktopBusAmd.js', included: false},
			'test/fakeExternalDependencies/**/*.js',
			'bower_components/jquery/dist/jquery.js',
			'bower_components/angular/angular.js',
			'bower_components/angular-mocks/angular-mocks.js',
			'bower_components/angular-cookies/angular-cookies.js',
			'bower_components/angular-resource/angular-resource.js',
			'bower_components/angular-route/angular-route.js',
			'bower_components/angular-sanitize/angular-sanitize.js',
			'bower_components/angular-bootstrap/ui-bootstrap.js',
			'bower_components/angular-translate/angular-translate.js',
            'test/faketrans/**/*.js',

			'bower_components/angular-blocks/dist/angular-blocks.js',
//			'bower_components/ventus/vendor/handlebars.js',
//			'bower_components/ventus/build/ventus.js',
//			'bower_components/conduitjs/lib/conduit.js',
			{pattern:'app/**/*.js', included: false},
			{pattern:'bower_components/**/*.js', included: false},
			{pattern:'test/**/*.test.js', included: false},
			'test/fakeExternalDependencies/fakefeedback.js',
			'test/test-main.js'
		],

		// list of files / patterns to exclude

		// web server port
		port: 8080,

		// Start these browsers, currently available:
		// - Chrome
		// - ChromeCanary
		// - Firefox
		// - Opera
		// - Safari (only Mac)
		// - PhantomJS
		// - IE (only Windows)
		browsers: [
			'Chrome'
		],

		customLaunchers: {
			Chrome_ci: {
				base: 'Chrome',
				flags: ['--no-sandbox']
			}
		},

		// Which plugins to enable
		plugins: [
			'karma-requirejs',
			'karma-mocha',
			'karma-chai',
			'karma-sinon',
			'karma-chrome-launcher',
			'karma-coverage'
		],

		// Continuous Integration mode
		// if true, it capture browsers, run tests and exit
		singleRun: false,

		colors: true,

		// level of logging
		// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
		logLevel: config.LOG_INFO,

		reporters: ['coverage'],

		preprocessors: {
			'app/**/*.js': ['coverage']
		},

		coverageReporter: {
			reporters:[
				{type: 'lcovonly', dir : 'build/reports/', subdir: '.'},
				{type: 'cobertura', dir : 'build/reports/', subdir: '.'}
			]
		}

		// Uncomment the following lines if you are using grunt's server to run the tests
		// proxies: {
		//   '/': 'http://localhost:9000/'
		// },
		// URL root prevent conflicts with the site root
		// urlRoot: '_karma_'
	});
	config.browsers = ['Chrome_ci'];
};
