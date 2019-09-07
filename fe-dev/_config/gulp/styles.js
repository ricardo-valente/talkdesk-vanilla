var gulp = require('gulp'),
	fs = require('fs'),
	plumber = require('gulp-plumber'),
	gutil = require('gulp-util');

var cfg = require(__dirname + '/../_config.js'),
	func = require(__dirname + '/../_functions.js'),
	pkg = JSON.parse(fs.readFileSync(__dirname+'/../../package.json')),
	prefix = pkg.assetsPrefix;

var banner = func.createBanner();

/** CSS -------------------------------------------------- */
gulp.task('sass', function () {
	var sass = require('gulp-sass'),
		postcss = require('gulp-postcss'),
		autoprefixer = require('autoprefixer'),
		csswring = require('csswring'),
		rename = require('gulp-rename'),
		sourcemaps = require('gulp-sourcemaps'),
		browserSync = require('browser-sync'),
		header = require('gulp-header');

	var processors = [autoprefixer({browsers: ['last 4 version']}), csswring];

	return gulp.src('./_stylesheets/app.scss')
		.pipe(plumber(function (error) {
			gutil.log(error.message);
			this.emit('end');
		}))
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(sourcemaps.write({includeContent: false}))
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(postcss(processors))
		.pipe(gulp.dest('./dist/css'))

		.pipe(header(banner, {pkg: pkg}))
		.pipe(rename('app.min.css'))
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest(cfg.dist.css))
		.pipe(browserSync.stream());
	//.pipe(browserSync.reload({stream: true}));
});
gulp.task('sass:deploy', function () {
	var sass = require('gulp-sass'),
		postcss = require('gulp-postcss'),
		autoprefixer = require('autoprefixer'),
		csswring = require('csswring'),
		rename = require('gulp-rename'),
		header = require('gulp-header');

	var processors = [autoprefixer({browsers: ['last 4 version']}), csswring];

	return gulp.src('./_stylesheets/app.scss')
		.pipe(plumber(function (error) {
			gutil.log(error.message);
			this.emit('end');
		}))
		.pipe(header('@charset "UTF-8";' + banner, {pkg: pkg}))
		.pipe(sass())
		.pipe(postcss(processors))
		.pipe(rename(prefix + 'app.min.css'))
		.pipe(gulp.dest('./dist/css'));
});
/** ------------------------------------------------------ */
