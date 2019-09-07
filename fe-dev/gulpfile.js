var gulp = require('gulp'),
	requireDir = require('require-dir'),
	runSeq = require('run-sequence');


/** MAIN TASKS -------------------------------------------------------------------------------------------------
 > info			> Informação sobre as TASKS de Gulp
 > serve        > Servidor local

 > deploy       > Deploy e Upload p/ DEV > Folder HTML
 > Acesso: 		> http://site.dev.byclients.com/html/index.html

 > deploy:live  > Deploy e Upload p/ DEV > Folder IMAGES + CSS + SCRIPTS
 > Acesso: 		> http://site.dev.byclients.com

 > dist			> Deploy de ficheiros p/ Servidor Local
 > dist:deploy  > Deploy de ficheiros p/ Produção
 -------------------------------------------------------------------------------------------------------------- */

requireDir('./_config/gulp', { recurse: true });


gulp.task('default', function (cb) {
	runSeq(
		'info',
		cb
	);
});
gulp.task('serve', function (cb) {
	runSeq(
		'verify:package',
		'dist',
		'localserve',
		cb
	);
});
gulp.task('deploy', function (cb) {
	runSeq(
		'verify:package',
		'verify:access1',
		'deploy:confirm1',

		'dist',

		/*
		'ftp:backup:static',
		'ftp:clean:static',
		'ftp:upload:static',
		*/
		cb
	);
});
gulp.task('deploy:live', function (cb) {
	runSeq(
		'verify:package',
		'verify:access2',
		'deploy:confirm2',
		'dist:deploy',
		/*'cleanftp:live',
        'upload:live',*/
		cb
	);
});
