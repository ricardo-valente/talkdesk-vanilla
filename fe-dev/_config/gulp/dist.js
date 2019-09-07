var gulp = require('gulp'),
	fs = require('fs'),
	runSeq = require('run-sequence'),
	merge = require('merge-stream'),
	git = require('gulp-git');

var cfg = require(__dirname + '/../_config.js'),
	pkg = JSON.parse(fs.readFileSync(__dirname+'/../../package.json')),
	prefix = pkg.assetsPrefix;

gulp.task('dist', function (cb) {
	runSeq(
		'dist:clean',
		[
			'data',
			'scripts',
			'sass',
			'images'
		],
		[
			'html:hbs',
			'html:index'
		],
		// 'html:accessibility',
		'html:prettify',
		cb
	);
});
gulp.task('dist:amp', function (cb) {
	runSeq('hbs:amp', 'less:amp', cb);
});
gulp.task('dist:deploy', function (cb) {
	return runSeq(
		'dist:clean',
		[
			'data:deploy',
			'scripts:deploy',
			'sass:deploy',
			'images:deploy'
		],
		'dist:rev',
		[
			'html:hbs:deploy',
			'html:index:deploy',
			'html:assetsPath:deploy'
		],
		'html:prettify',
		//'dist:addgit',
		'dist:cleanafter',
		cb
	);
});

gulp.task('dist:rev', function () {
	var rev = require('gulp-rev');

	var source = [
		'./dist/libs',
		'./dist/scripts',
		'./dist/css'
	];

	var p1 = gulp.src(source[0] + '/**/*')
		.pipe(rev())
		.pipe(gulp.dest(source[0]));

	var p2 = gulp.src([source[1] + '/**/*', '!' + source[1] + '/data/', '!' + source[1] + '/data/**'])
		.pipe(rev())
		.pipe(gulp.dest(source[1]));

	var p3 = gulp.src(source[2] + '/**/*')
		.pipe(rev())
		.pipe(gulp.dest(source[2]));

	return merge(p1, p2, p3)
		.pipe(rev.manifest())
		.pipe(gulp.dest(''));
});
gulp.task('dist:addgit', function () {
	var source = [
		'./dist/**/*'
	];
	return gulp.src(source)
		.pipe(git.add());
});
gulp.task('dist:clean', function () {
	var del = require('del');
	return del([
		'./dist/**/*'
	]);
});
gulp.task('dist:cleanafter', function () {
	var clean = require('gulp-clean');

	var globs = [
		cfg.dist.css + '/' + prefix + 'app.min.css',
		cfg.dist.libs + '/' + prefix + 'custom-plugins.min.js',
		cfg.dist.libs + '/' + prefix + 'head-vendor.min.js',
		cfg.dist.libs + '/' + prefix + 'vendor.min.js',
		cfg.dist.scripts + '/' + prefix + 'app.min.js'
	];

	return gulp.src(globs)
		.pipe(clean({force: true}));
});
