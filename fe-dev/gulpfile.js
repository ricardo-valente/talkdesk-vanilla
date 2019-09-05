var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    gutil = require('gulp-util'),
    runSeq = require('run-sequence'),
    merge = require('merge-stream'),
    git = require('gulp-git'),
    fs = require('fs'),
    jshint = require('gulp-jshint');

/* Config files + infos --------------------------------- */
var cfg = require('./gulp/_config'),
    pkg = JSON.parse(fs.readFileSync('./package.json')),
    idx = JSON.parse(fs.readFileSync('./_data/index.json')),
    prefix = pkg.assetsPrefix;

function ftpConfig() {
    access = require('./gulp/_access');

    return {
        host: access.ftp.host,
        user: access.ftp.user,
        password: access.ftp.password,
        parallel: 10,
        log: gutil.log
    };
}

function newDate() {
    var dt = new Date(),
        day = dt.getDate(),
        month = dt.getMonth() + 1,
        year = dt.getFullYear(),
        hour = dt.getHours(),
        minutes = dt.getMinutes(),
        seconds = dt.getSeconds();

    if (day.toString().length === 1) {
        day = '0' + day;
    }
    if (month.toString().length === 1) {
        month = '0' + month;
    }
    if (hour.toString().length === 1) {
        hour = '0' + hour;
    }
    if (minutes.toString().length === 1) {
        minutes = '0' + minutes;
    }
    if (seconds.toString().length === 1) {
        seconds = '0' + seconds;
    }

    return year + '' + month + '' + day + '-' + hour + '' + minutes + '' + seconds;
}

var banner = ['/**',
    ' * <%= pkg.name %>',
    ' * @Web <%= pkg.homepage %>',
    ' * @Author <%= pkg.author %> - <%= pkg.email %>',
    ' * Updated on: ' + newDate(),
    ' */',
    ''].join('\n');
/* ------------------------------------------------------ */

/* MAIN TASKS -------------------------------------------------------------------------------------------------
  > info			> Informação sobre as TASKS de Gulp
  > serve           > Servidor local

  > deploy          > Deploy e Upload p/ DEV > Folder HTML
  					> Acesso: http://site.dev.byclients.com/html/index.html

  > deploy:live     > Deploy e Upload p/ DEV > Folder IMAGES + CSS + SCRIPTS
  					> Acesso: http://site.dev.byclients.com

  > dist			> Deploy de ficheiros p/ Servidor Local
  > dist:deploy		> Deploy de ficheiros p/ Produção
-------------------------------------------------------------------------------------------------------------- */

gulp.task('default', function (cb) {
    runSeq(
        'info',
        cb
    );
});

gulp.task('serve', function (cb) {
    runSeq(
        'verify:package',
        'dist',
        'localserver',
        cb
    );
});
gulp.task('deploy', function (cb) {
    runSeq(
        'verify:package',
        'verify:access1',
        'deploy:confirm1',

        'dist',

        'ftp:backup:static',
        'ftp:clean:static',
        'ftp:upload:static',
        cb
    );
});
gulp.task('deploy:live', function (cb) {
    runSeq(
        'verify:package',
        'verify:access2',
        'deploy:confirm2',
        'dist:deploy',
        /*'cleanftp:live',
        'upload:live',*/
        cb
    );
});

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
            'html:index',
			//'html:accessibility'
        ],
        'html:prettify',
        cb
    );
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

gulp.task('localserver', function () {
    var browserSync = require('browser-sync');

    browserSync.create();
    browserSync.init({
        server: './dist'
    });

    gulp.watch([cfg.src.patterns + '/**/*.hbs'], ['html:default']);
    gulp.watch([cfg.src.sass], ['sass']);
    // gulp.watch([cfg.src.appJavascript], ['scripts:lint', 'scripts:app']);
    gulp.watch([cfg.src.appJavascript], ['scripts:app']);
    gulp.watch([cfg.src.data], ['data']);

    gulp.watch(cfg.dist.root + '/!**!/!*.html').on('change', browserSync.reload);
    gulp.watch(cfg.dist.root + '/*.html').on('change', browserSync.reload);
    gulp.watch(cfg.dist.root + '/scripts/*.js').on('change', browserSync.reload);
    gulp.watch(cfg.dist.root + '/data/**/*.json').on('change', browserSync.reload);
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
        './dist/css/' + prefix + 'app.min.css',
        './dist/libs/' + prefix + 'custom-plugins.min.js',
        './dist/libs/' + prefix + 'head-vendor.min.js',
        './dist/libs/' + prefix + 'vendor.min.js',
        './dist/scripts/' + prefix + 'app.min.js'
    ];

    return gulp.src(globs)
        .pipe(clean({force: true}));
});

/* Helpers TASKS ---------------------------------------- */
gulp.task('info', function (cb) {
    gutil.log(
        '\n\n\n' +
        '=========================================================================\n' +
        gutil.colors.cyan('INFO - Gulp Tasks ! \n') +
        gutil.colors.green('serve') + '        > Inicia o servidor local\n' +
        gutil.colors.green('dist') + '         > Distribuição de ficheiros p/ Servidor Local\n' +
        gutil.colors.green('dist:deploy') + '  > Distribuição de ficheiros p/ Produção\n' +
        gutil.colors.green('deploy') + '       > Deploy e Upload p/ DEV > Folder HTML\n' +
        gutil.colors.green('deploy:live') + '  > Deploy e Upload p/ DEV > Folder IMAGES + CSS + SCRIPTS\n' +
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
		jsonfile.writeFile('./_data/index.json', idx);
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
        pkg.name === '' || pkg.name === 'placeolder' ||
        pkg.description === '' || pkg.description === 'placeolder' ||
        pkg.assetsPrefix === 'placeolder' ||
        pkg.url === '' || pkg.url === 'placeolder'
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

    if (pkg.assetsPrefix === 'placeolder') {
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
		jsonfile.writeFile('./_data/index.json', idx);
    }
    else {
        return cb();
    }
});
gulp.task('verify:access1', function (cb) {
    var rename = require('gulp-rename');

    try {
        fs.accessSync('./gulp/_access.js');

        var ftp = ftpConfig();

        if (ftp.host !== '' && ftp.user !== '' && ftp.password !== '' && ftp.dest !== '') {
            return cb();

        } else {
            console.log(
                '\n' +
                '=========================================================================\n' +
                gutil.colors.red('You need to manually update your /gulp/_access.js file!\n') +
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
            'New /gulp/_access.js file created, you need to manually update this\n' +
            'credentials.\n' +
            gutil.colors.cyan('All system Stopped !\n') +
            '=========================================================================\n\n\n'
        );

        gulp
            .src('./gulp/_access.js.txt')
            .pipe(rename('_access.js'))
            .pipe(gulp.dest('./gulp/'));

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
        fs.accessSync('./gulp/_access.js');
        var ftp = ftpConfig();
        if (ftp.host !== '' && ftp.user !== '' && ftp.password !== '' && ftp.destlive !== '') {
            return cb();

        } else {
            console.log(
                '\n' +
                '=========================================================================\n' +
                gutil.colors.red('You need to manually update your /gulp/_access.js file!\n') +
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
            'New /gulp/_access.js file created, you need to manually update this\n' +
            'credentials.\n' +
            gutil.colors.cyan('All system Stopped !\n') +
            '=========================================================================\n\n\n'
        );

        gulp
            .src('./gulp/_access.js.txt')
            .pipe(rename('_access.js'))
            .pipe(gulp.dest('./gulp/'));
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
/* ------------------------------------------------------ */

/* HandleBars + HTML ------------------------------------ */
gulp.task('html:default', function (cb) {
	runSeq(
		[
			'html:hbs',
			'html:index',
			// 'html:accessibility'
		],
		'html:prettify',
		cb
	);

});

gulp.task('html:hbs', function () {
    var handlebars = require('gulp-compile-handlebars'),
        rename = require('gulp-rename'),
        htmlclean = require('gulp-htmlclean');

    var options = {
        batch: ['./_patterns'],
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
        batch: ['./_patterns'],
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
        batch: ['./_patterns'],
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
        batch: ['./_patterns'],
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
        batch: ['./_patterns'],
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
        batch: ['./_patterns'],
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
        rename = require('gulp-rename'),
		htmlclean = require('gulp-htmlclean');

    var source = [
        './_patterns/utilities/deploy/assets-head.hbs',
        './_patterns/utilities/deploy/assets-foot.hbs'
    ];

    var options = {
        batch: ['./_patterns'],
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

gulp.task('html:accessibility', function() {
	var rename = require('gulp-rename'),
		access = require('gulp-wcag-accessibility');

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
			reportLocation: './dist/data/',
			reportFileName: 'accessibility_validation',
			reportType: 'json',
			forceUrls: false,
			urls: [
				'http://www.w3schools.com/',
				'http://www.tutorialspoint.com/'
			]
		}))
});
/* ------------------------------------------------------ */

/* JS + CSS --------------------------------------------- */
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
        .pipe(gulp.dest('./dist/css'))
        .pipe(browserSync.stream());
});
gulp.task('scripts', function (cb) {
    runSeq(
        // 'scripts:lint',
        [
            'scripts:app',
            'scripts:custom',
            // 'scripts:head-vendor',
            'scripts:vendor'
        ],
        cb
    )
});
gulp.task('scripts:lint', function (cb) {
    var map = require('map-stream');
    var exitOnJshintError = map(function (file, cb) {
        if (!file.jshint.success) {
            console.error('jshint failed');
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
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(exitOnJshintError);
});
gulp.task('scripts:app', function () {
    var concat = require('gulp-concat'),
        rename = require('gulp-rename'),
        uglify = require('gulp-uglify'),
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
        // .pipe(uglify())
        // .pipe(header(banner, {pkg: pkg}))
        .pipe(rename('app.min.js'))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(cfg.dist.appJavascript));
});
gulp.task('scripts:custom', function () {
    var concat = require('gulp-concat'),
        rename = require('gulp-rename'),
        uglify = require('gulp-uglify'),
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
        uglify = require('gulp-uglify'),
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
        .pipe(sass())
        .pipe(postcss(processors))
        .pipe(header(banner, {pkg: pkg}))
        .pipe(rename(prefix + 'app.min.css'))
        .pipe(gulp.dest('./dist/css'));
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
        uglify = require('gulp-uglify'),
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
        uglify = require('gulp-uglify'),
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

        uglify = require('gulp-uglify'),
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
/* ------------------------------------------------------ */

/* DATA JSON -------------------------------------------- */
gulp.task('data', function () {
    var source = [
        './_data/**/*'
    ];
    return gulp.src(source)
        .pipe(plumber(function (error) {
            gutil.log(error.message);
            this.emit('end');
        }))
        .pipe(gulp.dest('./dist/data'));
});
gulp.task('data:deploy', function () {
    var jsonminify = require('gulp-jsonminify');

    var source = [
        './_data/**/*'
    ];
    return gulp.src(source)
        .pipe(plumber(function (error) {
            gutil.log(error.message);
            this.emit('end');
        }))
        .pipe(jsonminify())
        .pipe(gulp.dest('./dist/scripts/data'));
});
/* ------------------------------------------------------ */

/* IMG + SPRITES ---------------------------------------- */
gulp.task('images', function () {
    var newer = require('gulp-newer'),
        imagemin = require('gulp-imagemin'),
        pngquant = require('imagemin-pngquant');

    var source = [
        cfg.src.images
    ];

    return gulp.src(source)
        .pipe(plumber(function (error) {
            gutil.log(error.message);
            this.emit('end');
        }))
        .pipe(newer(cfg.dist.images))
        .pipe(gulp.dest(cfg.dist.images));
});
gulp.task('images:deploy', function () {
    var newer = require('gulp-newer'),
        imagemin = require('gulp-imagemin'),
        pngquant = require('imagemin-pngquant');

    var source = [
        cfg.src.images
    ];

    return gulp.src(source)
        .pipe(plumber(function (error) {
            gutil.log(error.message);
            this.emit('end');
        }))
        .pipe(newer(cfg.dist.images))
        .pipe(imagemin({
            progressive: false,
            svgoPlugins: [{removeViewBox: true}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(cfg.dist.images));
});
/* ------------------------------------------------------ */

/* UPLOAD FTP ------------------------------------------- */
var backuptag = 'backup_' + newDate();
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
        /*'./html/dist/images/**',
        './html/dist/libs/**',
        './html/dist/pages/**',
        './html/dist/scripts/**',*/
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
            /*'clean:static:images',
            'clean:static:libs',
            'clean:static:pages',
            'clean:static:scripts',*/
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

    var backuptag = '/backup_' + newDate();

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

    function newDate() {

        var dt = new Date(),
            day = dt.getDate(),
            month = dt.getMonth() + 1,
            year = dt.getFullYear(),
            hour = dt.getHours(),
            minutes = dt.getMinutes();

        if (day.toString().length == 1)
            day = '0' + day;

        if (month.toString().length == 1)
            month = '0' + month;

        if (hour.toString().length == 1)
            hour = '0' + hour;

        if (minutes.toString().length == 1)
            minutes = '0' + minutes;

        return year + month + day + '-T' + hour + minutes;
    }

    var backuptag = '/backup_' + newDate();

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

    function newDate() {

        var dt = new Date(),
            day = dt.getDate(),
            month = dt.getMonth() + 1,
            year = dt.getFullYear(),
            hour = dt.getHours(),
            minutes = dt.getMinutes();

        if (day.toString().length == 1)
            day = '0' + day;

        if (month.toString().length == 1)
            month = '0' + month;

        if (hour.toString().length == 1)
            hour = '0' + hour;

        if (minutes.toString().length == 1)
            minutes = '0' + minutes;

        return year + month + day + '-T' + hour + minutes;
    }

    var backuptag = '/backup_' + newDate();

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

    var backuptag = '/backup_' + newDate();

    return gulp.src(globs, {base: './html/dist/data', buffer: false})
        .pipe(plumber(function (error) {
            gutil.log(error.message);
            this.emit('end');
        }))
        .pipe(conn.dest(access.ftp.destlive + '/data'));
});
/* ------------------------------------------------------ */

/* CLEAN FTP -------------------------------------------- */

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
/* ------------------------------------------------------ */
