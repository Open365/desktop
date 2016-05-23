

// Generated on 2014-07-02 using generator-angular 0.9.1
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

var fs = require("fs");

module.exports = function (grunt) {

	// Load grunt tasks automatically
	require('load-grunt-tasks')(grunt);

	// Time how long tasks take. Can help when optimizing build times
	require('time-grunt')(grunt);

	// Configurable paths for the application
	var appConfig = {
		app: require('./bower.json').appPath || 'app',
		dist: 'dist'
	};

	var matches = grunt.file.expand('app/scripts/**/*.js');
	var requireFiles = [];

	if (matches.length > 0) {
		for (var x = 0; x < matches.length; x++) {
			var path = matches[x].replace(/.js/, '');
			path = path.replace('app/scripts/', '');
			if (
				path !== 'app'
				&& path !== 'dependencyLoaderDev'
				&& path !== 'dependencyLoaderBuild'
				&& path !== 'settingsStatic'
			) {
				requireFiles.push(path);
			}
		}
	}




	// Define the configuration for all the tasks
	grunt.initConfig({

		injector: {
			options : {
				addRootSlash: false,
				ignorePath: 'app'
			},
			debug: {
				files: {
					'<%= yeoman.app %>/index.html' : ['<%= yeoman.app %>/requirejsConfDev.js', '<%= yeoman.app %>/scripts/app.js']
				}
			},
			release : {
				files: {
					'<%= yeoman.app %>/index.html' : ['<%= yeoman.app %>/compiled/*.js']
				}
			}
		},

		requirejs: {
			compile: {
				options : {
					mainConfigFile:'<%= yeoman.app %>/requirejsConf.js',
					include: requireFiles,
					out: "<%= yeoman.app %>/compiled/desktop-all.min.js"
				}
			}
		},

		// Project settings
		yeoman: appConfig,

		// Watches requireFiles for changes and runs tasks based on the changed requireFiles
		watch: {
			bower: {
				files: ['bower.json'],
				tasks: ['wiredep:dev']
			},
			js: {
				files: ['<%= yeoman.app %>/scripts/{,*/}*.js'],
				tasks: ['newer:jshint:all'],
				options: {
					livereload: '<%= connect.options.livereload %>'
				}
			},
			jsTest: {
				files: ['test/spec/{,*/}*.js'],
				tasks: ['newer:jshint:test', 'karma']
			},
			compass: {
				files: ['<%= yeoman.app %>/themes/desktop/sass/{,*/}*.{scss,sass}'],
				tasks: ['compass:server', 'autoprefixer']
			},
			gruntfile: {
				files: ['Gruntfile.js']
			},
			livereload: {
				options: {
					livereload: '<%= connect.options.livereload %>'
				},
				files: [
					'<%= yeoman.app %>/{,*/}*.html',
					'.tmp/styles/{,*/}*.css',
					'<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
				]
			}
		},

		// The actual grunt server settings
		connect: {
			options: {
				port: 9000,
				// Change this to '0.0.0.0' to access the server from outside.
				hostname: '0.0.0.0',
				livereload: 35729
			},
			livereload: {
				options: {
					middleware: function (connect) {
						return [
							connect.static('.tmp'),
							connect().use(
								'/bower_components',
								connect.static('./bower_components')
							),
							connect.static(appConfig.app)
						];
					}
				}
			},
			test: {
				options: {
					port: 9001,
					middleware: function (connect) {
						return [
							connect.static('.tmp'),
							connect.static('test'),
							connect().use(
								'/bower_components',
								connect.static('./bower_components')
							),
							connect.static(appConfig.app)
						];
					}
				}
			},
			dist: {
				options: {
					base: '<%= yeoman.dist %>'
				}
			}
		},

		// Make sure code styles are up to par and there are no obvious mistakes
		jshint: {
			options: {
				jshintrc: '.jshintrc',
				reporter: require('jshint-stylish')
			},
			all: {
				src: [
					'Gruntfile.js',
					'<%= yeoman.app %>/scripts/{,*/}*.js'
				]
			},
			test: {
				options: {
					jshintrc: 'test/.jshintrc'
				},
				src: ['test/spec/{,*/}*.js']
			}
		},

		// Empties folders to start fresh
		clean: {
			dist: {
				files: [
					{
						dot: true,
						src: [
							'.tmp',
							'.sass-cache',
							'<%= yeoman.app %>/compiled',
							'<%= yeoman.dist %>/{,*/}*',
							'!<%= yeoman.dist %>/.git*'
						]
					}
				]
			},
			server: '.tmp'
		},

		// Add vendor prefixed styles (-webkit, -moz, -ms...)
		autoprefixer: {
			options: {
				browsers: ['last 1 version']
			},
			dist: {
				files: [
					{
						expand: true,
						cwd: '.tmp/styles/',
						src: '{,*/}*.css',
						dest: '.tmp/styles/'
					}
				]
			}
		},

		// Automatically inject Bower components into the app
		wiredep: {
			options: {
				cwd: '<%= yeoman.app %>/../'
			},
			dev: {
				src: ['<%= yeoman.app %>/index.html'],
				ignorePath: /..\//,
				exclude: [
					'bower_components/spice-web-client/application/WorkerProcess_c.js',
					'bower_components/eyeos-auth-client/build/eyeosAuthClient/*',
					'bower_components/uri.js/*',
					'bower_components/eyeos-schemes/*',
					'bower_components/almond/*'
				]
			},
			dist: {
				src: ['<%= yeoman.app %>/index.html'],
				ignorePath: /..\//,
				exclude: [
					'bower_components/spice-web-client/application/WorkerProcess_c.js',
					'bower_components/eyeos-auth-client/build/eyeosAuthClient/*',
					'bower_components/uri.js/*',
					'bower_components/eyeos-schemes/*'
				]
			},
			sass: {
				src: ['<%= yeoman.app %>/themes/desktop/sass/{,*/}*.{scss,sass}']
				//ignorePath: /(\.\.\/){1,2}bower_components\//
			}
		},

		// Compiles Sass to CSS and generates necessary requireFiles if requested
		compass: {
			options: {
				sassDir: '<%= yeoman.app %>/themes/desktop/sass',
				cssDir: '.tmp/styles',
				generatedImagesDir: '.tmp/images/generated',
				imagesDir: '<%= yeoman.app %>/images',
				javascriptsDir: '<%= yeoman.app %>/scripts',
				fontsDir: '<%= yeoman.app %>/themes/desktop/sass/fonts',
				importPath: './bower_components',
				httpImagesPath: '/images',
				httpGeneratedImagesPath: '/images/generated',
				httpFontsPath: '/themes/desktop/sass/fonts',
				relativeAssets: false,
				assetCacheBuster: false,
				raw: 'Sass::Script::Number.precision = 10\n'
			},
			dist: {
				options: {
					generatedImagesDir: '<%= yeoman.dist %>/images/generated'
				}
			},
			server: {
				options: {
					debugInfo: true
				}
			}
		},

		// Renames requireFiles for browser caching purposes
		filerev: {
			dist: {
				src: [
					'<%= yeoman.dist %>/scripts/{,*/}*.js',
					//'<%= yeoman.dist %>/scripts/translations/**/{,*/}*.json',
					'<%= yeoman.dist %>/styles/{,*/}*.css',
					'<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
					'!<%= yeoman.dist %>/images/icons/alert.png',
					'!<%= yeoman.dist %>/images/ping.png',
					'!<%= yeoman.dist %>/images/favicon/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
					'<%= yeoman.dist %>/themes/desktop/sass/fonts/*'
				]
			},
			modules: {
				src:['<%= yeoman.dist %>/modules/{,*/}*.js']
			},
			moduleFilesJson: {
				src:['<%= yeoman.dist %>/modules/moduleFiles.json']
			}
		},

		// Reads HTML for usemin blocks to enable smart builds that automatically
		// concat, minify and revision requireFiles. Creates configurations in memory so
		// additional tasks can operate on them
		useminPrepare: {
			html: '<%= yeoman.app %>/index.html',
			options: {
				dest: '<%= yeoman.dist %>',
				flow: {
					html: {
						steps: {
							js: ['concat'],
							css: ['cssmin']
						},
						post: {}
					}
				}
			}
		},


		useminPrepareDevConfig: {
			html: '<%= yeoman.app %>/index.html',
			options: {
				dest: '<%= yeoman.dist %>',
				flow: {
					html: {
						steps: {
							js: ['concat'],
							css: ['cssmin']
						},
						post: {}
					}
				}
			}
		},


		// Performs rewrites based on filerev and the useminPrepare configuration
		usemin: {
			html: ['<%= yeoman.dist %>/**/*.html'],
			css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
			json: [
				'<%= yeoman.dist %>/themes/**/compiled-info*.json',
				'<%= yeoman.dist %>/modules/**/moduleFiles.json'
			],
			options: {
				assetsDirs: ['<%= yeoman.dist %>', '<%= yeoman.dist %>/images']
			}
		},

		// The following *-min tasks will produce minified requireFiles in the dist folder
		// By default, your `index.html`'s <!-- Usemin block --> will take care of
		// minification. These next options are pre-configured if you do not wish
		// to use the Usemin blocks.
		// cssmin: {
		//   dist: {
		//     requireFiles: {
		//       '<%= yeoman.dist %>/styles/main.css': [
		//         '.tmp/styles/{,*/}*.css'
		//       ]
		//     }
		//   }
		// },
		// uglify: {
		//   dist: {
		//     requireFiles: {
		//       '<%= yeoman.dist %>/scripts/scripts.js': [
		//         '<%= yeoman.dist %>/scripts/scripts.js'
		//       ]
		//     }
		//   }
		// },
		// concat: {
		//   dist: {}
		// },

		imagemin: {
			dist: {
				files: [
					{
						expand: true,
						cwd: '<%= yeoman.app %>/images',
						src: '{,*/}*.{png,jpg,jpeg,gif}',
						dest: '<%= yeoman.dist %>/images'
					},
					{
						expand: true,
						cwd: '<%= yeoman.app %>/themes',
						src: '**/*.{png,jpg,jpeg,gif}',
						dest: '<%= yeoman.dist %>/themes'
					}
				]
			}
		},

		svgmin: {
			dist: {
				files: [
					{
						expand: true,
						cwd: '<%= yeoman.app %>/images',
						src: '{,*/}*.svg',
						dest: '<%= yeoman.dist %>/images'
					},
					{
						expand: true,
						cwd: '<%= yeoman.app %>/themes',
						src: '**/*.svg',
						dest: '<%= yeoman.dist %>/themes'
					}
				]
			}
		},

		htmlmin: {
			dist: {
				options: {
					collapseWhitespace: true,
					conservativeCollapse: true,
					collapseBooleanAttributes: true,
					removeCommentsFromCDATA: true,
					removeOptionalTags: true
				},
				files: [
					{
						expand: true,
						cwd: '<%= yeoman.dist %>',
						src: [
							'*.html',
							'themes/**/*.html',
							'addons/**/*.html'
						],
						dest: '<%= yeoman.dist %>'
					}
				]
			}
		},

		// ngmin tries to make the code safe for minification automatically by
		// using the Angular long form for dependency injection. It doesn't work on
		// things like resolve or inject so those have to be done manually.
		ngmin: {
			dist: {
				files: [
					{
						expand: true,
						cwd: '.tmp/concat/scripts',
						src: '*.js',
						dest: '.tmp/concat/scripts'
					}
				]
			}
		},

		// Replace Google CDN references
		cdnify: {
			dist: {
				html: ['<%= yeoman.dist %>/*.html']
			}
		},

		// Copies remaining requireFiles to places other tasks can use
		copy: {
			dist: {
				files: [
					{
						expand: true,
						dot: true,
						cwd: '<%= yeoman.app %>',
						dest: '<%= yeoman.dist %>',
						src: [
							'*.{ico,png,txt}',
							'.htaccess',
							'*.html',
							'themes/**/*.html',
							'addons/**/*.html',
							'addons/**/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
							'images/{,*/}*.{webp}',
							'fonts/*',
							'popup/*',
                            'third_party/*',
							'worker/*',
							'scripts/translations/literals/**',
							'scripts/settingsStatic.js',
							'resources/magnifier.png'
						]
					},
					{
						expand: true,
						cwd: '.tmp/images',
						dest: '<%= yeoman.dist %>/images',
						src: ['generated/*']
					},
					{
						expand: true,
						cwd: '.tmp/styles',
						dest: '<%= yeoman.dist %>/styles',
						src: ['*.css']
					},
					{
						expand: true,
						cwd: '.tmp',
						dest: '<%= yeoman.dist %>',
						src: ['themes/**/compiled-info.json']
					},
					{
						expand: true,
						cwd: '.',
						src: 'bower_components/bootstrap-sass-official/vendor/assets/fonts/bootstrap/*',
						dest: '<%= yeoman.dist %>'
					},
					{	expand: true,
						cwd: '.',
						dest: '<%= yeoman.dist %>',
						src: 'bower_components/spice-web-client/application/WorkerProcess_c.js'
					}
				]
			},
			styles: {
				expand: true,
				cwd: '<%= yeoman.app %>/themes/desktop/sass',
				dest: '.tmp/styles/',
				src: '{,*/}*.css'
			}
		},

		hash_replace_files: {
			options: {
				whereToReplace: [
					"<%= yeoman.dist %>/scripts/scripts.js"
				]
			},
			translations: {
				options: {
					files: ["<%= yeoman.dist %>/scripts/translations/literals/**/*.json"]
				}
			},
			compiledInfo: {
				options: {
					files: ["<%= yeoman.dist %>/themes/**/compiled-info.json"]
				}
			}
		},

		// Run some tasks in parallel to speed up the build process
		concurrent: {
			server: [
				'compass:server'
			],
			test: [
				'compass'
			],
			dist: [
				'compass:dist',
				'imagemin',
				'svgmin'
			]
		},

		// Test settings
		karma: {
			unit: {
				configFile: 'test/karma.conf.js',
				singleRun: true
			}
		}
	});

    grunt.registerTask('generateTranslationFiles', 'Generate .json translation files from .po' ,function() {
		var files = fs.readdirSync('locales');
		for(var i=0; i < files.length; i++) {
			var file = files[i];
			var fileData = file.split(".");
			var language = fileData[2].substr(0,2);
			var translationFile = "locales/"+file;
			var langData = language.split("_");
			var destFile = "app/scripts/translations/literals/"+language+"/translation.json";
			var shelljs = require('shelljs');
			var translationCommand = "i18next-conv -l " + langData[0] + " -s " + translationFile + " -t " + destFile;
			console.log(translationCommand);
			shelljs.exec(translationCommand);
		}

    });


	grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
		if (target === 'dist') {
			return grunt.task.run(['build', 'connect:dist:keepalive']);
		}

		grunt.task.run([
			'clean:server',
            'generateTranslationFiles',
			'applyIndexTemplate',
			'applySettings:develop',
			'wiredep:dev',
			'wiredep:sass',
			'requirejs',
			'injector:debug',
			'concurrent:server',
			'autoprefixer',
			'connect:livereload',
			'watch'
		]);
	});

	grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function (target) {
		grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
		grunt.task.run(['serve:' + target]);
	});

	grunt.registerTask('test', [
		'clean:server',
		'applySettings:develop',
		'concurrent:test',
		'autoprefixer',
		'connect:test',
		'karma'
	]);

	grunt.registerTask('applyIndexTemplate', function() {
		fs.writeFileSync("app/index.html", fs.readFileSync("app/index.template"));
	});

	grunt.registerTask('applySettings', function(target) {
		fs.writeFileSync("app/scripts/settings.js", fs.readFileSync("app/settings/"+target+".js"));
	});

	grunt.registerTask('addModule', function (target) {
		if(target === 'peopleAndGroups' ) {
			var done = this.async();
			fs.readFile("app/scripts/settings.js", 'utf8', function (err, data) {
				if (err) {
					console.log(err);
					done();
					return;
				}
				var replacedSettings = data.replace("'PEOPLE_GROUPS_ENABLED': false", "'PEOPLE_GROUPS_ENABLED': true");

				fs.writeFile("app/scripts/settings.js", replacedSettings, 'utf8', function (err) {
					if (err) {
						console.log(err);
					}
					done();
					return;
				});
			});
		}
	});

	grunt.registerTask('useminPrepareDev', function () {
		var useminPrepareDevConfig = grunt.config('useminPrepareDevConfig');
		grunt.config.set('useminPrepare', useminPrepareDevConfig);
		grunt.task.run('useminPrepare');
	});

	grunt.registerTask('build', function (target){ //debug or release
		if (target === 'debug') { // adding optimize none to the require build
			var config = grunt.config('requirejs');
			config.compile.options.optimize = "none";
			grunt.config('requirejs', config);
		}

		grunt.task.run([
			'clean:dist',
			'generateTranslationFiles',
			'applyIndexTemplate',
			'applySettings:release',
			'wiredep:dist',
			'wiredep:sass',
			'requirejs',
			'injector:release',

			'useminPrepare',
			'concurrent:dist',
			'build-themes',
			'autoprefixer',
			'concat',
			'ngmin',
			'copy:dist',
			'hash_replace_files',
			'cssmin',
			'filerev:dist',
			'usemin',
			'htmlmin',
			'build-modules'
		]);
	});

	grunt.registerTask('build-activate-people-module', function (){
		grunt.task.run('build');
		grunt.task.run('addModule:peopleAndGroups');
	});

	grunt.registerTask('default', [
		'newer:jshint',
		'test',
		'build'
	]);

	// Proposed by Nistal
	grunt.registerTask('merda', function () {
		var cmd = 'xdg-open "https://cacalogue.files.wordpress.com/2010/06/cacamikaze.jpg"';
		require('child_process').exec(cmd, function (){});
	});

	grunt.registerTask('build-modules', 'Builds the modules to be consumed by the platform', function () {
		var requirejsOptions = {};

		var modules = grunt.file.expand('app/modules/*');
		modules.forEach(function (module) {
			var moduleName = module.split('/').pop();
			requirejsOptions[moduleName] = {
				options: {
					mainConfigFile: '<%= yeoman.app %>/requirejsConf.js',
					out: "<%= yeoman.dist %>/modules/" + moduleName + "/" + moduleName + ".min.js",
					include: "../modules/" + moduleName + "/" + moduleName,
					exclude: ["settings"],
					optimize: "none"
				}
			};
		});

		grunt.config('requirejs', requirejsOptions);

		grunt.task.run([
			'requirejs',
			'fix-module-paths',
			'filerev:modules',
			'wire-modules',
			'filerev:moduleFilesJson',
			'fix-module-json-path'
		]);
	});

	grunt.registerTask('fix-module-paths', 'Fixes the generated module path that r.js generates', function () {
		var modulesPath = grunt.config('yeoman').dist + "/modules/**/*.js";

		var modules = grunt.file.expand(modulesPath);
		console.log(modulesPath, modules);

		modules.forEach(function (module) {
			var moduleContent = grunt.file.read(module);
			grunt.file.write(module, moduleContent.replace("define('../modules", "define('modules"));
		});

	});

	grunt.registerTask('fix-module-json-path', 'Fixes the generated module json path that r.js generates', function () {
		var modulesPath = grunt.config('yeoman').dist + "/scripts/**/*.js";

		var modules = grunt.file.expand(modulesPath);
		modules.forEach(function (module) {
			var moduleContent = grunt.file.read(module);
			var hashedFiles = grunt.filerev.summary;
			if(hashedFiles['dist/modules/moduleFiles.json']) {
				var moduleFilesVersionedPath = hashedFiles['dist/modules/moduleFiles.json'].replace('dist/modules', '');
				grunt.file.write(module, moduleContent.replace("moduleFiles.json", moduleFilesVersionedPath));
			}
		});
	});


	grunt.registerTask('wire-modules', 'Generates a file to link the name of the modules to the new path that results after filerev ', function () {
		var dist = grunt.config('yeoman').dist + "/" ;
		var modulesPath = dist + "modules/";

		var modules = {};
		var summary = grunt.filerev.summary;
		Object.keys(summary).forEach(function (key) {
			var newKey = key.replace(modulesPath, "").split("/")[0];
			modules[newKey] = summary[key].replace(dist, '');
		});

		grunt.file.write(modulesPath + "moduleFiles.json", JSON.stringify(modules, null, '\t'));
	});

	function listThemes() {
		var themes = [];
		var themeDir = __dirname + '/app/themes';
		var fs = require('fs');
		var dirs = fs.readdirSync(themeDir);
		dirs.forEach(function(themeName) {
			if (themeName !== 'base' && themeName !== '.DS_Store') {
				themes.push(themeName);
			}
		});
		return themes;
	}

	function saveCompiledInfo(themeName, themeInfo) {
		var compiledInfo = {};
		compiledInfo.cssFile = "styles/" + themeName + ".css";
		compiledInfo.hooks = themeInfo.getHooks();
		compiledInfo.addonTemplates = themeInfo.getAddonTemplates();
		compiledInfo.modules = themeInfo.getModules();

		grunt.file.write(grunt.config('yeoman').dist + '/themes/' + themeName + '/compiled-info.json', JSON.stringify(compiledInfo, null, '\t'));
	}

	grunt.registerTask('build-themes', function buildThemes() {
		var themes = listThemes();
		themes.forEach(function (theme) {
			grunt.task.run('build-theme:' + theme);
		});
	});

	grunt.registerTask('build-theme', function buildTheme(themeName) {
		var done = this.async();
		var settings = {
			themesPath: __dirname + '/app/themes/',
			addonsPath: __dirname + '/app/addons/',
			baseSassUrl: __dirname + '/app/'
		};

		var ThemeFactory = require('eyeos-theme').ThemeFactory;
		var ThemeSassCompiler = require('eyeos-theme').ThemeSassCompiler;

		var themeFactory = new ThemeFactory(settings);

		themeFactory.getTheme(themeName, function(err, theme) {
			var themeSassCompiler = new ThemeSassCompiler(settings);
			themeSassCompiler.compile(theme.getSass(), function (err, css) {
				if (err) {
					console.log("Error during the sass compilation.");
					if (err.file) {
						console.log("You can find the all the original sass data at /tmp/sassPreCompilationFile.scss");
						console.log("Error in line ", err.line, "column", err.column);
					}
					throw err;
				}
				grunt.file.write('.tmp/styles/' + themeName + '.css', css);
				saveCompiledInfo(themeName, theme);
				done();
			});
		});
	});
};
