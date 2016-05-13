var hashAndReplaceFiles = function (grunt, files, whereToReplace) {

	var hashFiles = require('hash-files');
	var fs = require('fs');
	var path = require('path');
	var async = require("async");
	var done = this.async();

	var dist = grunt.config('yeoman').dist + "/" ;
	var whereToReplace = whereToReplace || dist+'scripts/scripts.js';


	var hashOptions = {
		files: files
	};
	hashFiles(hashOptions, function(error, hash) {
		if (!error) {
			var filesPath = grunt.file.expand(files);
			var originalFilename = path.basename(filesPath[0], hash);
			var hashedFilename = getHashedFilename(originalFilename, hash);

			function getHashedFilename(originalFilename, hash) {
				var splittedName = originalFilename.split('.');
				splittedName[splittedName.length-1] = hash + '.' + splittedName[splittedName.length-1];
				return splittedName.join('.');
			}

			replaceFileReferences(whereToReplace);
			async.each(filesPath, renameFile, done);

			function renameFile (filepath, cb) {
				var hashedFilePath = filepath.replace(originalFilename, hashedFilename);
				fs.rename(filepath, hashedFilePath, function (err) {
					if(err) {
						cb('Error renaming filepath: '+ err);
					}
					console.log('Filename hashed', hashedFilePath);
					cb();
				});
			}

			function replaceFileReferences (file) {
				var fileContent = grunt.file.read(file);
				var replacedFileContent = fileContent.replace(originalFilename, hashedFilename);
				grunt.file.write(file, replacedFileContent);
			}
		}
	});
};

module.exports = hashAndReplaceFiles;
