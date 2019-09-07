var gulp = require('gulp'),
	plumber = require('gulp-plumber'),
	gutil = require('gulp-util');

var cfg = require(__dirname + '/../_config.js');

/** IMG + SPRITES ---------------------------------------- */
var imagemin = require('gulp-imagemin'),
	ice = require('imagemin-jpeg-recompress'),
	pngquant = require('imagemin-pngquant'),
	cache = require('gulp-cache'),
	clean = require('gulp-clean'),
	source = [cfg.src.images];

gulp.task('images:clean', function () {
	return gulp.src(cfg.dist.images, {read: false})
		.pipe(clean());
});

gulp.task('images', function () {
	return gulp.src(source)
		.pipe(plumber(function (error) {
			gutil.log(error.message);
			this.emit('end');
		}))
		.pipe(cache(imagemin({
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant(), ice()]
		})))
		.pipe(gulp.dest(cfg.dist.images));
});
gulp.task('images:deploy', function () {
	return gulp.src(source)
		.pipe(plumber(function (error) {
			gutil.log(error.message);
			this.emit('end');
		}))
		.pipe(cache(imagemin({
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant(), ice()]
		})))
		.pipe(gulp.dest(cfg.dist.images));
});
/** ------------------------------------------------------ */
