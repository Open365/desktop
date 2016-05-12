var hashTranslationFiles = function (grunt) {

	var hashFiles = require('hash-files');
	var fs = require('fs');
	var async = require("async");
	var done = this.async();

	var dist = grunt.config('yeoman').dist + "/" ;
	var translationsPath = dist + "scripts/translations/";
	var translationsFile = "translation.json";

	var hashOptions = {
		files: [translationsPath+'literals/**/*.json']
	};
	hashFiles(hashOptions, function(error, hash) {
		if (!error) {
			var translations = grunt.file.expand(translationsPath+'literals/**/*.json');
			var hashedTranslationFilename = "translation."+hash+".json";

			replaceTranslationFileReferences(dist+'scripts/scripts.js');
			async.each(translations, renameTranslationFile, done);

			function renameTranslationFile (translation, cb) {
				var hashedTranslationFile = translation.replace(translationsFile, hashedTranslationFilename);
				fs.rename(translation, hashedTranslationFile, function (err) {
					if(err) {
						cb('Error renaming translation file: '+ err);
					}
					console.log('Translation filename hashed', hashedTranslationFile);
					cb();
				});
			}

			function replaceTranslationFileReferences (file) {
				var fileContent = grunt.file.read(file);
				var replacedFileContent = fileContent.replace(translationsFile, hashedTranslationFilename);
				grunt.file.write(file, replacedFileContent);
			}
		}
	});
};

module.exports = hashTranslationFiles;
