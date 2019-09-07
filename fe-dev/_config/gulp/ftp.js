var gulp = require('gulp'),
	plumber = require('gulp-plumber'),
	gutil = require('gulp-util'),
	runSeq = require('run-sequence'),
	merge = require('merge-stream');

var func = require(__dirname + '/../_functions.js');
var newDate = func.newDate();
function ftpConfig() {
	access = require(__dirname + '/../_access');

	return {
		host: access.ftp.host,
		user: access.ftp.user,
		password: access.ftp.password,
		parallel: 10,
		log: gutil.log
	};
}


/* UPLOAD FTP ------------------------------------------- */
var backuptag = 'backup_' + newDate;
gulp.task('ftp:backup:static', function (cb) {
	runSeq(
		'ftp:backup:static:1',
		'ftp:backup:static:2',
		cb
	);
});

gulp.task('ftp:backup:static:1', function (cb) {
	var EasyFtp = require('easy-ftp'),
		ftp = new EasyFtp(),
		config = {
			host: access.ftp.host,
			port: 21,
			username: access.ftp.user,
			password: access.ftp.password
		},

		//folders = ['css', 'data', 'images', 'libs', 'pages', 'scripts', 'index.html'],
		folders = ['css', 'data', 'index.html'],
		arrDownload = [];

	ftp.connect(config);

	folders.forEach(function (v) {
		var obj = {remote: access.ftp.dest + '/' + v, local: './backup/' + backuptag};
		arrDownload.push(obj);
	});

	ftp.download(arrDownload, function () {
		ftp.close();
		cb();
	});
});
gulp.task('ftp:backup:static:2', function (cb) {
	var ftp2 = require('vinyl-ftp'),
		conn = ftp2.create(ftpConfig());

	return gulp.src('./backup/' + backuptag + '/**', {buffer: false})
		.pipe(conn.dest(access.ftp.dest + '/' + backuptag));
});

gulp.task('ftp:upload:static', function (cb) {
	var ftp = require('vinyl-ftp'),
		conn = ftp.create(ftpConfig());

	var globs = [
		'./html/dist/css/**',
		'./html/dist/data/**',
		// './html/dist/images/**',
		// './html/dist/libs/**',
		// './html/dist/pages/**',
		// './html/dist/scripts/**',
		'./html/dist/index.html'
	];

	return gulp.src(globs, {base: './html/dist', buffer: false})
		.pipe(plumber(function (error) {
			gutil.log(error.message);
			this.emit('end');
		}))
		.pipe(conn.dest(access.ftp.dest));

});

gulp.task('ftp:clean:static', function (cb) {
	runSeq(
		[
			'clean:static:css',
			'clean:static:data',
			'clean:static:images',
			// 'clean:static:libs',
			// 'clean:static:pages',
			// 'clean:static:scripts',
			'clean:static:index'
		],
		cb
	);
});
gulp.task('clean:static:css', function (cb) {
	var ftp = require('vinyl-ftp'),
		conn = ftp.create(ftpConfig());

	return conn.rmdir(access.ftp.dest + '/css', function () {
		cb();
	});
});
gulp.task('clean:static:data', function (cb) {
	var ftp = require('vinyl-ftp'),
		conn = ftp.create(ftpConfig());

	return conn.rmdir(access.ftp.dest + '/css', function () {
		cb();
	});
});
gulp.task('clean:static:images', function (cb) {
	var ftp = require('vinyl-ftp'),
		conn = ftp.create(ftpConfig());

	return conn.rmdir(access.ftp.dest + '/css', function () {
		cb();
	});
});
gulp.task('clean:static:libs', function (cb) {
	var ftp = require('vinyl-ftp'),
		conn = ftp.create(ftpConfig());

	return conn.rmdir(access.ftp.dest + '/css', function () {
		cb();
	});
});
gulp.task('clean:static:pages', function (cb) {
	var ftp = require('vinyl-ftp'),
		conn = ftp.create(ftpConfig());

	return conn.rmdir(access.ftp.dest + '/css', function () {
		cb();
	});
});
gulp.task('clean:static:scripts', function (cb) {
	var ftp = require('vinyl-ftp'),
		conn = ftp.create(ftpConfig());

	return conn.rmdir(access.ftp.dest + '/css', function () {
		cb();
	});
});
gulp.task('clean:static:index', function (cb) {
	var ftp = require('vinyl-ftp'),
		conn = ftp.create(ftpConfig());

	return conn.rmdir(access.ftp.dest + '/index.html', function () {
		cb();
	});
});

gulp.task('upload:live', function (cb) {
	runSeq(
		[
			'upload:live:css',
			'upload:live:images',
			'upload:live:libs',
			'upload:live:scripts',
			'upload:live:data'
		],
		cb
	);
});
gulp.task('upload:live:css', function () {
	var ftp = require('vinyl-ftp'),
		conn = ftp.create(ftpConfig());

	var globs = [
		'./html/dist/css/**'
	];

	var backuptag = '/backup_' + newDate;

	var p1 = gulp.src(globs, {base: './html/dist/css', buffer: false})
		.pipe(plumber(function (error) {
			gutil.log(error.message);
			this.emit('end');
		}))
		.pipe(conn.dest(access.ftp.destlive + '/css'));

	var p2 = gulp.src(globs, {base: './html/dist/css', buffer: false})
		.pipe(plumber(function (error) {
			gutil.log(error.message);
			this.emit('end');
		}))
		.pipe(conn.dest(access.ftp.destlive + '/css' + backuptag));

	return merge(p1, p2);
});
gulp.task('upload:live:images', function () {
	var ftp = require('vinyl-ftp'),
		conn = ftp.create(ftpConfig());

	var globs = [
		'./html/dist/images/**'
	];

	return gulp.src(globs, {base: './html/dist/images', buffer: false})
		.pipe(plumber(function (error) {
			gutil.log(error.message);
			this.emit('end');
		}))
		.pipe(conn.dest(access.ftp.destlive + '/images'));
});
gulp.task('upload:live:libs', function () {
	var ftp = require('vinyl-ftp'),
		conn = ftp.create(ftpConfig());

	var globs = [
		'./html/dist/libs/**'
	];

	var backuptag = '/backup_' + newDate;

	var p1 = gulp.src(globs, {base: './html/dist/libs', buffer: false})
		.pipe(plumber(function (error) {
			gutil.log(error.message);
			this.emit('end');
		}))
		.pipe(conn.dest(access.ftp.destlive + '/libs'));

	var p2 = gulp.src(globs, {base: './html/dist/libs', buffer: false})
		.pipe(plumber(function (error) {
			gutil.log(error.message);
			this.emit('end');
		}))
		.pipe(conn.dest(access.ftp.destlive + '/libs' + backuptag));

	return merge(p1, p2);
});
gulp.task('upload:live:scripts', function () {
	var ftp = require('vinyl-ftp'),
		conn = ftp.create(ftpConfig());

	var globs = [
		'./html/dist/scripts/**'
	];

	var backuptag = '/backup_' + newDate;

	var p1 = gulp.src(globs, {base: './html/dist/scripts', buffer: false})
		.pipe(plumber(function (error) {
			gutil.log(error.message);
			this.emit('end');
		}))
		.pipe(conn.dest(access.ftp.destlive + '/scripts'));

	var p2 = gulp.src(globs, {base: './html/dist/scripts', buffer: false})
		.pipe(plumber(function (error) {
			gutil.log(error.message);
			this.emit('end');
		}))
		.pipe(conn.dest(access.ftp.destlive + '/scripts' + backuptag));

	return merge(p1, p2);
});
gulp.task('upload:live:data', function () {
	var ftp = require('vinyl-ftp'),
		conn = ftp.create(ftpConfig());

	var globs = [
		'./html/dist/data/**'
	];

	var backuptag = '/backup_' + newDate;

	return gulp.src(globs, {base: './html/dist/data', buffer: false})
		.pipe(plumber(function (error) {
			gutil.log(error.message);
			this.emit('end');
		}))
		.pipe(conn.dest(access.ftp.destlive + '/data'));
});
/** ------------------------------------------------------ */


/** CLEAN FTP -------------------------------------------- */
gulp.task('cleanftp:live', function (cb) {
	runSeq(
		[
			'ftp:delLive:css',
			'ftp:delLive:images',
			'ftp:delLive:libs',
			'ftp:delLive:scripts'
		],
		cb
	);
});
gulp.task('ftp:delLive:css', function (cb) {
	var ftp = require('vinyl-ftp'),
		conn = ftp.create(ftpConfig());

	return conn.rmdir(access.ftp.destlive + '/css', function (err) {
		cb();
	});
});
gulp.task('ftp:delLive:images', function (cb) {
	var ftp = require('vinyl-ftp'),
		conn = ftp.create(ftpConfig());

	return conn.rmdir(access.ftp.destlive + '/images', function (err) {
		cb();
	});
});
gulp.task('ftp:delLive:libs', function (cb) {
	var ftp = require('vinyl-ftp'),
		conn = ftp.create(ftpConfig());

	return conn.rmdir(access.ftp.destlive + '/libs', function (err) {
		cb();
	});
});
gulp.task('ftp:delLive:scripts', function (cb) {
	var ftp = require('vinyl-ftp'),
		conn = ftp.create(ftpConfig());

	return conn.rmdir(access.ftp.destlive + '/scripts', function (err) {
		cb();
	});
});
/** ------------------------------------------------------ */
