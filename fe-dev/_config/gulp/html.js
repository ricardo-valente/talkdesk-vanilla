var gulp = require('gulp'),
	plumber = require('gulp-plumber'),
	gutil = require('gulp-util'),
	runSeq = require('run-sequence'),
	fs = require('fs');

var cfg = require(__dirname + '/../_config.js'),
	pkg = JSON.parse(fs.readFileSync(__dirname+'/../../package.json')),
	prefix = pkg.assetsPrefix;

/** HandleBars + HTML ------------------------------------ */
gulp.task('html:default', function (cb) {
	runSeq(
		[
			'html:hbs',
			'html:index'
		],
		// 'html:accessibility',
		'html:prettify',
		cb
	);

});

gulp.task('html:hbs', function () {
	var handlebars = require('gulp-compile-handlebars'),
		rename = require('gulp-rename');

	var options = {
		batch: [cfg.src.patterns],
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
		cfg.src.templates + '/*.hbs'
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
		.pipe(gulp.dest(cfg.dist.templates))
});
gulp.task('html:hbs:dev', function () {
	var handlebars = require('gulp-compile-handlebars'),
		rename = require('gulp-rename');

	var options = {
		batch: [cfg.src.patterns],
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
				return '' + ['/' + context.hash.type, path].join('/');
			}
		}
	};

	var source = [
		cfg.src.templates + '/*.hbs'
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
		.pipe(gulp.dest(cfg.dist.templates))
});
gulp.task('html:hbs:deploy', function () {
	var handlebars = require('gulp-compile-handlebars'),
		rename = require('gulp-rename');

	var source = [
		cfg.src.templates + '/*.hbs'
	];

	var options = {
		batch: [cfg.src.patterns],
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
				return ['/' + context.hash.type, context.data.root[path]].join('/');
			}
		}
	};

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
		.pipe(gulp.dest(cfg.dist.templates))
});

gulp.task('html:index', function () {
	var handlebars = require('gulp-compile-handlebars'),
		rename = require('gulp-rename');

	var source = [
		'./_patterns/index.hbs'
	];

	var options = {
		batch: [cfg.src.patterns],
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
			},
			codeLang: function () {
				return 'pt';
			}
		}
	};

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
		.pipe(gulp.dest(cfg.dist.root));
});
gulp.task('html:index:dev', function () {
	var handlebars = require('gulp-compile-handlebars'),
		rename = require('gulp-rename');

	var source = [
		'./_patterns/index.hbs'
	];

	var templateData = JSON.parse(fs.readFileSync('./rev-manifest.json', 'utf8'));
	var options = {
		batch: [cfg.src.patterns],
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
				return '' + ['/' + context.hash.type, path].join('/');
			}
		}
	};

	return gulp.src(source)
		.pipe(plumber(function (error) {
			gutil.log(error.message);
			this.emit('end');
		}))
		.pipe(handlebars(templateData, options))
		.pipe(rename(function (path) {
			path.extname = '.html';
		}))
		.pipe(gulp.dest(cfg.dist.root));
});
gulp.task('html:index:deploy', function () {
	var handlebars = require('gulp-compile-handlebars'),
		rename = require('gulp-rename');

	var source = [
		'./_patterns/index.hbs'
	];

	var options = {
		batch: [cfg.src.patterns],
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
				return ['/' + context.hash.type, context.data.root[path]].join('/');
			}
		}
	};

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
		.pipe(gulp.dest(cfg.dist.root));
});

gulp.task('html:prettify', function () {
	var handlebars = require('gulp-compile-handlebars'),
		prettify = require('gulp-prettify'),
		rename = require('gulp-rename');

	var source = [
		'./dist/pages/**/*.html',
		'./dist/index.html'
	];

	return gulp.src(source, {base: './'})
		.pipe(plumber(function (error) {
			gutil.log(error.message);
			this.emit('end');
		}))
		.pipe(prettify({
			indent_size: 4
		}))
		.pipe(gulp.dest('./'));
});
gulp.task('html:assetsPath:deploy', function () {

	var handlebars = require('gulp-compile-handlebars'),
		rename = require('gulp-rename');

	var source = [
		'./_patterns/utilities/deploy/assets-head.hbs',
		'./_patterns/utilities/deploy/assets-foot.hbs'
	];

	var options = {
		batch: [cfg.src.patterns],
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
				return ['/' + context.hash.type, context.data.root[prefix + path]].join('/');
			},
			serverCode: function (context) {
				return context.hash.code;
			},
			codeLang: function () {
				return '@lang';
			}
		}
	};

	var templateData = JSON.parse(fs.readFileSync('./rev-manifest.json', 'utf8'));
	return gulp.src(source[0])
		.pipe(plumber(function (error) {
			gutil.log(error.message);
			this.emit('end');
		}))
		.pipe(handlebars(templateData, options))
		.pipe(rename(function (path) {
			path.extname = '.cshtml';
		}))
		.pipe(gulp.dest(cfg.dist.css))

		.pipe(gulp.src(source[1]))
		.pipe(handlebars(templateData, options))
		.pipe(rename(function (path) {
			path.extname = '.cshtml';
		}))
		.pipe(gulp.dest(cfg.dist.appJavascript))
});

gulp.task('html:accessibility', function () {
	var access = require('gulp-wcag-accessibility');

	return gulp.src('./dist/pages/**/*.html')
		.pipe(access({
			accessibilityLevel: 'WCAG2AA',
			maxBuffer: '1024*1024',
			force: true,
			verbose: true,
			reportLevels: {
				notice: false,
				warning: true,
				error: true
			},
			reportLocation: '/_config/',
			reportFileName: 'accessibility_validation',
			reportType: 'json',
			forceUrls: false,
			urls: [
				'http://www.w3schools.com/',
				'http://www.tutorialspoint.com/'
			]
		}))
});
/** ------------------------------------------------------ */
