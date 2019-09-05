module.exports = {
    src: {
        patterns        : './_patterns',
        templates       : './_patterns/templates',
        appJavascript   : './_scripts/**/*.js',
        libs            : './_libs/vendor/',
        plugins         : './_libs/custom/',
        sass            : './_stylesheets/**/*.scss',
        images          : './_images/**/*',
        data          	: './_data/**/*.json'
    },
    dist: {
        root            : './dist',
        templates       : './dist/pages',
        appJavascript   : './dist/scripts',
        libs            : './dist/libs',
        css             : './dist/css',
        images          : './dist/images'
    },

  libsLIST: [
    // './_libs/vendor/' + 'jquery/dist/jquery.min.js',
    // './_libs/vendor/' + 'hammerjs/hammer.min.js',
    // './_libs/vendor/' + 'js-cookie/src/js.cookie.js'

    //OTHER LIBS HERE:

  ]
};
