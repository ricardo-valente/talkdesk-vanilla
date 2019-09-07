var gulp = require('gulp'),
	fs = require('fs'),
	plumber = require('gulp-plumber'),
	gutil = require('gulp-util'),
	runSeq = require('run-sequence'),
	browserSync = require('browser-sync');

var cfg = require(__dirname + '/../_config.js');

var htmlreplace = require('gulp-html-replace'),
	concat = require('gulp-concat'),
	replace = require('gulp-replace');

gulp.task('html:amp', function () {
	var handlebars = require('gulp-compile-handlebars'),
		rename = require('gulp-rename');

	var options = {
		batch: [cfg.src.patternsAMP],
		helpers: {
			compare: function (lvalue, rvalue, options) {
				if (arguments.length < 3)
					throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

				var operator = options.hash.operator || "==";

				var operators = {
					'==': function (l, r) {
						return l == r;
					},
					'===': function (l, r) {
						return l === r;
					},
					'!=': function (l, r) {
						return l != r;
					},
					'<': function (l, r) {
						return l < r;
					},
					'>': function (l, r) {
						return l > r;
					},
					'<=': function (l, r) {
						return l <= r;
					},
					'>=': function (l, r) {
						return l >= r;
					},
					'typeof': function (l, r) {
						return typeof l == r;
					},
					'contains': function (l, r) {
						return l ? l.indexOf(r) !== -1 : false;
					}
				};

				if (!operators[operator])
					throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);

				var result = operators[operator](lvalue, rvalue);

				if (result) {
					return options.fn(this);
				} else {
					return options.inverse(this);
				}

			},

			assetPath: function (path, context) {
				return ['/' + context.hash.type, path].join('/');
			}
		}
	};

	var source = [
		cfg.src.templatesAMP + '/*.hbs'
	];
	var templateData = JSON.parse(fs.readFileSync('./rev-manifest.json', 'utf8'));

	return gulp.src(source)
		.pipe(plumber(function (error) {
			gutil.log(error.message);
			this.emit('end');
		}))
		.pipe(handlebars(templateData, options))
		.pipe(rename(function (path) {
			path.extname = '.html';
		}))
		.pipe(gulp.dest(cfg.dist.templatesAMP))
});
gulp.task('sass:amp', function () {
	var sass = require('gulp-sass'),
		postcss = require('gulp-postcss'),
		autoprefixer = require('autoprefixer'),
		csswring = require('csswring'),
		rename = require('gulp-rename'),
		sourcemaps = require('gulp-sourcemaps');

	return gulp.src(cfg.src.sassAMP)
		.pipe(plumber(function (error) {
			gutil.log(error.message);
			this.emit('end');
		}))
		.pipe(sourcemaps.init())
		.pipe(sass({
			plugins: [autoprefixer]
		}))
		.pipe(postcss([csswring]))
		.pipe(rename('amp.min.css'))
		.pipe(gulp.dest(cfg.dist.cssAMP))
		.pipe(browserSync.stream());
});
gulp.task('inline:amp', function (cb) {
	runSeq(
		'uncss',
		'concat:amp',
		'inject:css',
		'clean:amp',
		'clean:text',
		cb
	);
});
gulp.task('uncss', function (cb) {
	var uncss = require('gulp-uncss'),
		rename = require('gulp-rename');
	fs.readdir(cfg.dist.templatesAMP, function (err, files) {
		var count = files.length,
			n = 0;
		files.forEach(function (f) {
			n++;

			console.log('Cleaning CSS for', f, 'AMP page');

			if (count === n) {
				var r = gulp.src(cfg.dist.css + '/app.min.css')
					.pipe(uncss({
						html: [cfg.dist.templatesAMP +'/'+ f]
					}))
					.pipe(rename(f + '.css'))
					.pipe(gulp.dest(cfg.dist.cssAMP))
					.on('end', cb);
			}
			else {
				var r =  gulp.src(cfg.dist.css + '/app.min.css')
					.pipe(uncss({
						html: [cfg.dist.templatesAMP +'/'+ f]
					}))
					.pipe(rename(f + '.css'))
					.pipe(gulp.dest(cfg.dist.cssAMP));
			}
		});
	});
});
gulp.task('concat:amp', function (cb) {
	fs.readdir(cfg.dist.templatesAMP, function (err, files) {
		// setTimeout(function () {
		var count = files.length,
			n = 0;
		files.forEach(function (f) {
			n++;

			console.log('Concat AMP css to ', f);

			if (count === n) {
				var r = gulp.src([cfg.dist.cssAMP +'/'+ f + '.css', cfg.dist.cssAMP + '/amp.min.css'])
					.pipe(concat(f + '.css'))
					.pipe(gulp.dest(cfg.dist.cssAMP))
					.on('end', cb);
			} else {
				var r = gulp.src([cfg.dist.cssAMP +'/'+ f + '.css', cfg.dist.cssAMP + '/amp.min.css'])
					.pipe(concat(f + '.css'))
					.pipe(gulp.dest(cfg.dist.cssAMP))
			}
		});
		// }, 2000)
	});
});
gulp.task('inject:css', function (cb) {
	fs.readdir(cfg.dist.templatesAMP, function (err, files) {
		var count = files.length,
			n = 0;
		files.forEach(function (f) {
			n++;

			console.log('Inject CSS to', f, 'AMP page');

			if (count === n) {
				return gulp.src(cfg.dist.templatesAMP + f)
					.pipe(htmlreplace({
						inlineCss: {
							src: gulp.src(cfg.dist.cssAMP + f + '.css'),
							tpl: '<style amp-custom type="text/css">%s</style>'
						},
						inlineAmp: {
							src: gulp.src(cfg.dist.cssAMP + f + '.css'),
							tpl: '<style amp-extention="custom-" type="text/css">%s</style>'
						}
					}))
					.pipe(gulp.dest(cfg.dist.templatesAMP))
					.on('end', cb);
			} else {
				return gulp.src(cfg.dist.templatesAMP + f)
					.pipe(htmlreplace({
						inlineCss: {
							src: gulp.src(cfg.dist.cssAMP + f + '.css'),
							tpl: '<style amp-custom type="text/css">%s</style>'
						},
						inlineAmp: {
							src: gulp.src(cfg.dist.cssAMP + f + '.css'),
							tpl: '<style amp-extention="custom-" type="text/css">%s</style>'
						}
					}))
					.pipe(gulp.dest(cfg.dist.templatesAMP))
			}
		});
	});
});
gulp.task('clean:amp', function (cb) {
	return gulp.src(cfg.dist.cssAMP, {
			read: false
		})
		.pipe(plumber(function (error) {
			gutil.log(error.message);
			this.emit('end');
		}))
		.pipe(clean());
});
gulp.task('clean:text', function () {
	return gulp.src([cfg.dist.templatesAMP+'/*.html'])
		.pipe(replace('@charset "UTF-8";', ''))
		.pipe(replace('@page{margin:2cm .5cm}', ''))
		.pipe(replace('@-ms-viewport{width:device-width}', ''))
		.pipe(replace('!important', ''))
		.pipe(gulp.dest(cfg.dist.templatesAMP));
});
