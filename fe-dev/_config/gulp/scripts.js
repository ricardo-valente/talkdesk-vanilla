var gulp = require('gulp'),
	plumber = require('gulp-plumber'),
	gutil = require('gulp-util'),
	runSeq = require('run-sequence'),
	jshint = require('gulp-jshint'),
	fs = require('fs');

var cfg = require(__dirname + '/../_config.js'),
	func = require(__dirname + '/../_functions.js'),
	pkg = JSON.parse(fs.readFileSync(__dirname+'/../../package.json')),
	prefix = pkg.assetsPrefix;

var banner = func.createBanner();

/** JS --------------------------------------------------- */
gulp.task('scripts', function (cb) {
	runSeq(
		// 'scripts:lint',
		[
			'scripts:app',
			'scripts:custom',
			// 'scripts:head-vendor',
			// 'scripts:vendor'
		],
		cb
	)
});
gulp.task('scripts:lint', function (cb) {
	var map = require('map-stream');
	var exitOnJshintError = map(function (file, cb) {
		if (!file.jshint.success) {
			console.error('jshint failed server terminated');
			process.exit(1);
		} else {
			cb();
		}
	});

	var source = [
		'./_scripts/app.js',
		cfg.src.appJavascript
	];
	return gulp.src(source)
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'), {beep: true})
		.pipe(exitOnJshintError);
});
gulp.task('scripts:app', function () {
	var concat = require('gulp-concat'),
		rename = require('gulp-rename'),
		uglify = require('gulp-terser'),
		sourcemaps = require('gulp-sourcemaps'),
		header = require('gulp-header');

	var source = [
		'./_scripts/app.js',
		cfg.src.appJavascript
	];
	return gulp.src(source)
		.pipe(plumber(function (error) {
			gutil.log(error.message);
			this.emit('end');
		}))
		.pipe(sourcemaps.init())
		.pipe(concat('app.js'))
		.pipe(gulp.dest(cfg.dist.appJavascript))
		.pipe(uglify())
		.pipe(header(banner, {pkg: pkg}))
		.pipe(rename('app.min.js'))
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest(cfg.dist.appJavascript));
});
gulp.task('scripts:custom', function () {
	var concat = require('gulp-concat'),
		rename = require('gulp-rename'),
		uglify = require('gulp-terser'),
		sourcemaps = require('gulp-sourcemaps');

	/*
  Plugins que não existem em repositório e/ou que tiveram que ser alteradas
   */
	var plugins = [
		cfg.src.plugins + 'custom-plugins.js'
	];
	return gulp.src(plugins)
		.pipe(plumber(function (error) {
			gutil.log(error.message);
			this.emit('end');
		}))
		.pipe(sourcemaps.init())
		.pipe(concat('custom-plugins.js'))
		.pipe(gulp.dest(cfg.dist.libs))
		.pipe(uglify())
		.pipe(rename('custom-plugins.min.js'))
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest(cfg.dist.libs));
});
gulp.task('scripts:head-vendor', function () {
	var concat = require('gulp-concat'),
		rename = require('gulp-rename'),
		uglify = require('gulp-terser'),
		sourcemaps = require('gulp-sourcemaps');

	var plugins = [
		cfg.src.libs + 'modernizr/modernizr.js'
	];
	return gulp.src(plugins)
		.pipe(plumber(function (error) {
			gutil.log(error.message);
			this.emit('end');
		}))
		.pipe(sourcemaps.init())
		.pipe(concat('head-vendor.js'))
		.pipe(gulp.dest(cfg.dist.libs))
		.pipe(uglify())
		.pipe(rename('head-vendor.min.js'))
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest(cfg.dist.libs));
});
gulp.task('scripts:vendor', function () {
	var concat = require('gulp-concat'),
		sourcemaps = require('gulp-sourcemaps');

	return gulp.src(cfg.libsLIST)
		.pipe(plumber(function (error) {
			gutil.log(error.message);
			this.emit('end');
		}))
		.pipe(sourcemaps.init())
		.pipe(concat('vendor.min.js'))
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest(cfg.dist.libs));
});

gulp.task('scripts:deploy', function (cb) {
	runSeq(
		[
			'scripts:deploy:app',
			'scripts:deploy:custom',
			'scripts:deploy:head-vendor',
			'scripts:deploy:vendor'
		],
		cb
	)
});
gulp.task('scripts:deploy:app', function () {
	var concat = require('gulp-concat'),
		rename = require('gulp-rename'),
		uglify = require('gulp-terser'),
		header = require('gulp-header'),

		removeCode = require('gulp-remove-code'),
		stripDebug = require('gulp-strip-debug'),

		map = require('map-stream'),
		exitOnJshintError = map(function (file, cb) {
			if (!file.jshint.success) {
				console.error('>>> jshint Failed! <<<\n');
				process.exit(1);
			} else {
				cb();
			}
		});

	var source = [
		'./_scripts/app.js',
		cfg.src.appJavascript
	];
	return gulp.src(source)
		.pipe(plumber(function (error) {
			gutil.log(error.message);
			this.emit('end');
		}))
		.pipe(concat(prefix + 'app.js'))
		.pipe(removeCode({production: true}))
		.pipe(stripDebug())
		/*.pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(exitOnJshintError)*/
		.pipe(uglify())
		.pipe(header(banner, {pkg: pkg}))
		.pipe(rename(prefix + 'app.min.js'))
		.pipe(gulp.dest(cfg.dist.appJavascript));
});
gulp.task('scripts:deploy:custom', function () {
	var concat = require('gulp-concat'),
		rename = require('gulp-rename'),
		uglify = require('gulp-terser'),
		header = require('gulp-header');

	/*
   Plugins que não existem em repositório e/ou que tiveram que ser alteradas
   */
	var plugins = [
		cfg.src.plugins + 'custom-plugins.js'
	];
	return gulp.src(plugins)
		.pipe(plumber(function (error) {
			gutil.log(error.message);
			this.emit('end');
		}))
		.pipe(concat(prefix + 'custom-plugins.js'))
		.pipe(uglify())
		.pipe(header(banner, {pkg: pkg}))
		.pipe(rename(prefix + 'custom-plugins.min.js'))
		.pipe(gulp.dest(cfg.dist.libs));
});
gulp.task('scripts:deploy:head-vendor', function () {
	var concat = require('gulp-concat'),
		header = require('gulp-header'),

		uglify = require('gulp-terser'),
		stripDebug = require('gulp-strip-debug');

	var plugins = [
		cfg.src.libs + 'modernizr/modernizr.js'
	];
	return gulp.src(plugins)
		.pipe(plumber(function (error) {
			gutil.log(error.message);
			this.emit('end');
		}))
		.pipe(concat(prefix + 'head-vendor.min.js'))
		.pipe(stripDebug())
		.pipe(uglify())
		.pipe(header(banner, {pkg: pkg}))
		.pipe(gulp.dest(cfg.dist.libs));
});
gulp.task('scripts:deploy:vendor', function () {
	var concat = require('gulp-concat'),
		header = require('gulp-header');

	return gulp.src(cfg.libsLIST)
		.pipe(plumber(function (error) {
			gutil.log(error.message);
			this.emit('end');
		}))
		.pipe(concat(prefix + 'vendor.min.js'))
		.pipe(header(banner, {pkg: pkg}))
		.pipe(gulp.dest(cfg.dist.libs));
});
/** ------------------------------------------------------ */
