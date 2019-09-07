var gulp = require('gulp'),
	plumber = require('gulp-plumber'),
	gutil = require('gulp-util');

var cfg = require(__dirname + '/../_config.js');

/** DATA JSON -------------------------------------------- */
gulp.task('data', function () {
	var source = [
		cfg.src.data,
		'./_config/**/accessibility_validation.json',
		'./_config/**/index.json'
	];
	return gulp.src(source)
		.pipe(plumber(function (error) {
			gutil.log(error.message);
			this.emit('end');
		}))
		.pipe(gulp.dest(cfg.dist.data));
});
gulp.task('data:deploy', function () {
	var jsonminify = require('gulp-jsonminify');

	var source = [
		cfg.src.data,
		'!./data/**/accessibility_validation.json',
		'!./data/**/index.json'
	];
	return gulp.src(source)
		.pipe(plumber(function (error) {
			gutil.log(error.message);
			this.emit('end');
		}))
		.pipe(jsonminify())
		.pipe(gulp.dest('./dist/data'));
});
/** ------------------------------------------------------ */
