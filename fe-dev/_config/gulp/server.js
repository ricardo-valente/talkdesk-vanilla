var gulp = require('gulp'),
	browserSync = require('browser-sync');

var cfg = require(__dirname + '/../_config.js');

gulp.task('localserve', function () {
	browserSync.init({
		server: './dist'
	});

	gulp.watch([cfg.src.patterns + '/**/*.hbs'], ['html:default']);
	gulp.watch([cfg.src.sass], ['sass']);
	gulp.watch([cfg.src.appJavascript], ['scripts:app']);
	gulp.watch([cfg.src.data], ['data']);
	gulp.watch([cfg.src.images], ['images:clean', 'images']);

	gulp.watch(cfg.dist.root + '/*.html').on('change', browserSync.reload);
	gulp.watch(cfg.dist.root + '/scripts/*.js').on('change', browserSync.reload);
	gulp.watch(cfg.dist.root + '/data/**/*.json').on('change', browserSync.reload);
	gulp.watch(cfg.dist.root + '/css/*.css').on('change', browserSync.stream);
});
