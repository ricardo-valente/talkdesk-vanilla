var gulp = require('gulp'),
	gutil = require('gulp-util'),
	fs = require('fs');

var pkg = JSON.parse(fs.readFileSync(__dirname+'/../../package.json')),
	idx = JSON.parse(fs.readFileSync(__dirname + '/../index.json'));

/** Helpers TASKS ---------------------------------------- */
gulp.task('info', function (cb) {
	gutil.log(
		'\n\n\n' +
		'=========================================================================\n' +
		gutil.colors.cyan('INFO - Gulp Tasks ! \n') +
		gutil.colors.green('config') + '       > Project configuration start (name, description, assets prefix, dev url)\n' +
		gutil.colors.green('serve') + '        > Starts the local server\n' +
		gutil.colors.green('dist') + '         > Distribution of files for Local Server\n' +
		gutil.colors.green('dist:deploy') + '  > Distribution of files for Production\n' +
		gutil.colors.green('deploy') + '       > Deploy and Upload to DEV > Folder HTML\n' +
		gutil.colors.green('deploy:live') + '  > Deploy and Upload to DEV > Folder IMAGES + CSS + SCRIPTS\n' +
		'\n'
	);
	return cb();
});
gulp.task('config', function (cb) {
	var readlineSync = require('readline-sync'),
		jsonfile = require('jsonfile');

	//VERIFY PACKAGE INFO
	var updFile = true;

	gutil.log(
		'\n\n\n' +
		'=========================================================================\n' +
		gutil.colors.red('IMPORTANT ! \n') +
		'Please fill in the necessary data about this project:\n' +
		' - Name - Add a name to your project (no spaces, lowercase)\n' +
		' - Description - Small description of your project\n' +
		' - Assets Prefix - A prefix to your assets ("prefix-" prefix-app.min.css), can be left blank (app.min.css)\n' +
		' - URL - Dev environment link (http://site.dev.byclients.com)\n' +
		'\n'
	);

	pkg.name = readlineSync.question('> Project name: ');
	idx.index.project.name = pkg.name;
	pkg.description = readlineSync.question('> Project description: ');
	idx.index.project.desc = pkg.description;
	pkg.assetsPrefix = readlineSync.question('> Project assets prefix: ');
	pkg.url = readlineSync.question('> Project url: ');

	if (updFile) {
		jsonfile.writeFile('./package.json', pkg, {spaces: 4}, function (err) {
			console.log(
				'\n' +
				gutil.colors.green('Thank You - Lets continue!\n') +
				'=========================================================================\n\n\n'
			);
			return cb();
		});
		jsonfile.writeFile('./_config/index.json', idx);
	} else {
		return cb();
	}
});
gulp.task('verify:package', function (cb) {
	var readlineSync = require('readline-sync'),
		jsonfile = require('jsonfile');

	//VERIFY PACKAGE INFO
	var updFile = false;

	if (
		pkg.name === '' || pkg.name === 'placeholder' ||
		pkg.description === '' || pkg.description === 'placeholder' ||
		pkg.assetsPrefix === 'placeholder' ||
		pkg.url === '' || pkg.url === 'placeholder'
	) {
		console.log(
			'\n\n\n' +
			'=========================================================================\n' +
			gutil.colors.red('IMPORTANT ! \n') +
			'Your package.json file is incomplete. \nPlease fill in the necessary data about this project:\n' +
			' - Name - Add a name to your project (no spaces, lowercase)\n' +
			' - Description - Small description of your project\n' +
			' - Assets Prefix - A prefix to your assets ("prefix-" prefix-app.min.css), can be left blank (app.min.css)\n' +
			' - URL - Dev environment link (http://site.dev.byclients.com)\n' +
			'\n'
		);
	}

	if (pkg.name === '' || pkg.name === 'placeolder') {
		pkg.name = readlineSync.question('> Project name: ');
		idx.index.project.name = pkg.name;
		updFile = true;
	}

	if (pkg.description === '' || pkg.description === 'placeolder') {
		pkg.description = readlineSync.question('> Project description: ');
		idx.index.project.desc = pkg.description;
		updFile = true;
	}

	if (pkg.assetsPrefix === 'placeholder') {
		pkg.assetsPrefix = readlineSync.question('> Project assets prefix: ');
		updFile = true;
	}

	if (pkg.url === '' || pkg.url === 'placeolder') {
		pkg.url = readlineSync.question('> Project url: ');
		updFile = true;
	}

	if (updFile) {
		jsonfile.writeFile('./package.json', pkg, {spaces: 4}, function (err) {
			console.log(
				'\n' +
				gutil.colors.green('Thank You - Lets continue!\n') +
				'=========================================================================\n\n\n'
			);
			return cb();
		});
		jsonfile.writeFile('./_config/index.json', idx);
	}
	else {
		return cb();
	}
});

gulp.task('verify:access1', function (cb) {
	var rename = require('gulp-rename');

	try {
		fs.accessSync('./_config/_access.js');

		var ftp = ftpConfig();

		if (ftp.host !== '' && ftp.user !== '' && ftp.password !== '' && ftp.dest !== '') {
			return cb();

		} else {
			console.log(
				'\n' +
				'=========================================================================\n' +
				gutil.colors.red('You need to manually update your /_config/_access.js file!\n') +
				gutil.colors.cyan('All system Stopped !\n') +
				'=========================================================================\n\n\n'
			);
			process.exit(1);
		}
	}
	catch (e) {
		console.log(
			'\n' +
			'=========================================================================\n' +
			'New /_config/_access.js file created, you need to manually update this\n' +
			'credentials.\n' +
			gutil.colors.cyan('All system Stopped !\n') +
			'=========================================================================\n\n\n'
		);

		gulp
			.src('./_config/_access.js.txt')
			.pipe(rename('_access.js'))
			.pipe(gulp.dest('./_config/'));

		//process.exit(1);
	}

});
gulp.task('deploy:confirm1', function (cb) {
	var readlineSync = require('readline-sync');

	if (readlineSync.keyInYN(
			'\n\n\n' +
			'=========================================================================\n' +
			gutil.colors.red('WHAT ARE YOU DOING? \n') +
			'This task will upload all you DIST files to DEV SERVER, to a HTML folder\n' +
			'for templating test.  \n' +
			'\n' +
			'*     Type: ' + gutil.colors.green('DEV - Static\n') +
			'*    Local: ' + gutil.colors.green('dist/\n') +
			'*   Server: ' + gutil.colors.green('html/\n') +
			'*      Url: ' + gutil.colors.green(pkg.url + '/index.html\n') +
			'\n' +
			'=========================================================================\n\n' +
			'\n' +
			'Are ' + gutil.colors.magenta('YOU') + ' sure??\n\n\n'
		)) {
		return cb();
	}
	else {
		console.log(
			'\n' +
			gutil.colors.cyan('Ok, all system Stopped !\n') +
			'=========================================================================\n\n\n'
		);
		process.exit(1);
	}
});

gulp.task('verify:access2', function (cb) {
	var rename = require('gulp-rename');

	try {
		fs.accessSync('./_config/_access.js');
		var ftp = ftpConfig();
		if (ftp.host !== '' && ftp.user !== '' && ftp.password !== '' && ftp.destlive !== '') {
			return cb();

		} else {
			console.log(
				'\n' +
				'=========================================================================\n' +
				gutil.colors.red('You need to manually update your /_config/_access.js file!\n') +
				gutil.colors.cyan('All system Stopped !\n') +
				'=========================================================================\n\n\n'
			);
			process.exit(1);
		}

	}
	catch (e) {
		console.log(
			'\n' +
			'=========================================================================\n' +
			'New /_config/_access.js file created, you need to manually update this\n' +
			'credentials.\n' +
			gutil.colors.cyan('All system Stopped !\n') +
			'=========================================================================\n\n\n'
		);

		gulp
			.src('./_config/_access.js.txt')
			.pipe(rename('_access.js'))
			.pipe(gulp.dest('./_config/'));
	}

});
gulp.task('deploy:confirm2', function (cb) {
	var readlineSync = require('readline-sync');

	if (readlineSync.keyInYN(
			'\n\n\n' +
			'=========================================================================\n' +
			gutil.colors.red('WHAT ARE YOU DOING? \n') +
			'This task will upload all you DIST files to DEV SERVER. \n' +
			'It will upload to each asset folder on the server, this requires that the\n' +
			'server is ready for this files: ' + gutil.colors.red('assets-head.cshtml + assets-foot.cshtmln \n') +
			'\n' +
			'*     Type: ' + gutil.colors.green('DEV - Live!\n') +
			'*    Local: ' + gutil.colors.green('dist/\n') +
			'*   Server: ' + gutil.colors.green('css/ + scripts/ + libs/ + images/ + data/\n') +
			'*      Url: ' + gutil.colors.green(pkg.url + '\n') +
			'\n' +
			'=========================================================================\n' +
			'\n' +
			'After this upload, and if everything is OK, you still need to manually\n' +
			'upload your dist files to STAGE and PROD environments.' +
			'\n' +
			'\n' +
			'Are ' + gutil.colors.magenta('YOU') + ' sure??\n\n\n'
		)) {
		return cb();
	}
	else {
		console.log(
			'\n' +
			gutil.colors.cyan('Ok, all system Stopped !\n') +
			'=========================================================================\n\n\n'
		);
		process.exit(1);
	}
});
/** ------------------------------------------------------ */
