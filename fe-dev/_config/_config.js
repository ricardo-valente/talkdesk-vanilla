module.exports = {
    src: {
        patterns        : './_patterns',
        patternsAMP     : './_patterns_amp',
        templates       : './_patterns/templates',
        templatesAMP    : './_patterns_amp/templates',
        appJavascript   : './_scripts/**/*.js',
        libs            : './_libs/vendor/',
        plugins         : './_libs/custom/',
        sass            : './_stylesheets/**/*.scss',
        sassAMP         : './_stylesheets/amp.scss',
        images          : './_images/**/*.*',
        data          	: './_data/**/*.json'
    },
    dist: {
        root            : './dist',
        templates       : './dist/pages',
        templatesAMP    : './dist/pages/amp',
        appJavascript   : './dist/scripts',
        libs            : './dist/libs',
        css             : './dist/css',
        cssAMP          : './dist/css/temp',
        images          : './dist/images',
        data            : './dist/data'
    },

	libsLIST: [
		// './_libs/vendor/' + 'jquery/dist/jquery.min.js'

		// OTHER LIBS HERE:
		// './_libs/vendor/' + 'hammerjs/hammer.min.js',
	]
};
