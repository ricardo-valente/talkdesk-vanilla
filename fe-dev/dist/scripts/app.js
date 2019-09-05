/*
 * INFO:
 * 	> Main script initializer
 * 	> Change the var "app" to something related to the project
 * 	> Search for usage
 */

let app = {
  //Configs + Constants

  //removeIf(production)
  debug: true,
  debugLocalIps: ['localhost', '192.168.6.141'],
  //endRemoveIf(production)

  mobileWidth: '768',
  loadedFonts: 0,
  loadedImages: 0,
  lang: document.querySelector('body').getAttribute('[data-lang]'),
  host: window.location.hostname,
  browser: false,
  navigator: '',

  SIZE: {
    wW: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
    wH: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
  },

  DATA: {},

  COOKIES_NAMES: {
    ACCEPT: 'acceptCookie'
  },

  exists: (el) => {
    return ($(el).length > 0);
  },

  isMobile: () => {
    return (app.SIZE.wW <= app.mobileWidth);
  },

  //removeIf(production)
  debugEnvir: () => {
    return (app.debug && app.host !== undefined && app.debugLocalIps.length > 0 && app.debugLocalIps.indexOf(app.host) > -1);
  },
  //endRemoveIf(production)

  init: () => {
    // GLOBAL VARS ---------------------------------------
    $doc = document.documentElement;
    $body = $doc.querySelector('body');

    //ON RESIZE
    let reportWindowSize = () => {
      app.SIZE.wW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      app.SIZE.wH = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      console.log('app window.onresize');
    };
    window.onresize = reportWindowSize;


    // COMMON --------------------------------------------


    // COMPONENTS ----------------------------------------
    if ($doc.querySelector('#search-input')) {
      app.search.init();
    }


        // PAGES ---------------------------------------------

    }
};

(() => {
  'use strict';
  document.addEventListener('DOMContentLoaded', () => {
    //removeIf(production)
    console.warn('ATENÇÃO: Debug está ligado!');
    console.log('-- DOCUMENT IS READY - GO GO --');
    //endRemoveIf(production)

    app.init();

  });
})();

app.helpers = {
	// COMMON --------------------------------------------
	// Configs + Constants
	TIMERS: '',
	DATA: '',
	AJAX: '',


	// MAIN FUNCTIONS ------------------------------------
	init: () => {
		let _this = app.helpers;

		_this.setupEvents();
		_this.setupLayout();
	},

	setupEvents: () => {},
	setupLayout: () => {},



	// OTHER FUNCTIONS -----------------------------------
	browserDetect: () => {
		let ua = window.navigator.userAgent;

		let msie = ua.indexOf('MSIE ');
		if (msie > 0) {
			// IE 10 or older => return version number
			return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
		}

		let trident = ua.indexOf('Trident/');
		if (trident > 0) {
			// IE 11 => return version number
			let rv = ua.indexOf('rv:');
			return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
		}

		let edge = ua.indexOf('Edge/');
		if (edge > 0) {
			// Edge (IE 12+) => return version number
			return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
		}

		// other browser
		return false;
	},

	osDetect: () => {
		let res = false;
		if (navigator.appVersion.indexOf("Win")!==-1){res="Windows";}
		else if (navigator.appVersion.indexOf("Mac")!==-1){res="MacOS";}
		else if (navigator.appVersion.indexOf("X11")!==-1){res="UNIX";}
		else if (navigator.appVersion.indexOf("Linux")!==-1){res="Linux";}

		return res;
	},

	getUrlParam: (name, url) => {
		if (!url) url = window.location.href;
		name = name.replace(/[\[\]]/g, "\\$&");
		let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
			results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	},

	getRandom: (min, max, type) => {
		if(type === 'int'){
			min = Math.ceil(min);
			max = Math.floor(max);

			return Math.floor(Math.random() * (max - min + 1)) + min;
		}
		else{
			return Math.random() * (max - min) + min;
		}
	}
};

app.search = {
  // COMMON --------------------------------------------
  // Configs + Constants
  TIMERS: '',
  DATA: '',
  API_SEARCH: 'https://talkdesk-com.meza.talkdeskqa.com/wp-json/external/globalsearch?search=',
  PAGE_SIZE: 12,



  // MAIN FUNCTIONS ------------------------------------
  init: () => {
    console.log('=====\nApp Search Init\n');
    let _this = app.search;

    _this.firstPaint();
    _this.setupLayout();
    _this.setupEvents();

  },

  setupEvents: () => {
    console.log('=====\nApp Search === Events\n');
    let _this = app.search;

    if (!!_this.DATA && !!_this.DATA.posts.length) {
      let paginationTotal = _this.DATA.posts.length;
      let totalPages = (paginationTotal - _this.PAGE_SIZE) <= 0 ? 0 : ((paginationTotal - _this.PAGE_SIZE) / _this.PAGE_SIZE).toFixed();

    }

    document.addEventListener('click', function (event) {
      // If the clicked element doesn't have the right selector, bail
      if (!event.target.matches('.pagination--item')) return;

      // Don't follow the link
      event.preventDefault();

      // Log the clicked element in the console
      console.log(event.target.getAttribute('data-page'));
    }, false);
  },

  setupLayout: () => {
    console.log('=====\nApp Search === layout\n');
    let _this = app.search;

    // Setup cards
    const cardsTemplate = (content, idx) => {
      return `
        <a href="${content.url}" class="" target="_self" title="${content.title}">
          <span class="card__label text-orange">${content.category}</span>
          <span class="card__label text-capitalize">${content.date}</span>
          <h4 class="card__title">${content.title}</h4>
          <p class="card__url">${content.url.replace(/^.*:\/\//i, '')}</p>
        </a>
      `};

    // Setup cards
    if (!!_this.DATA && _this.DATA.posts.length) {
      _this.DATA.posts.map((content, idx) => {
        let markupHtml = cardsTemplate(content, idx);
        let container = document.createElement('div');

        container.className = 'col-12 card';
        container.innerHTML = markupHtml;

        document.getElementById('search-results--cards').append(container);
      });
    };

    // Setup filters
    const filtersTemplate = (content, idx) => {
      return `
        <a href="javascrip:;" data-filters="${content.slug}">${content.label}</a>
      `
    };

    if (!!_this.DATA && _this.DATA.posts.length) {
      _this.DATA.menu.map((content, idx) => {
        let markupHtml = filtersTemplate(content, idx);
        let container = document.createElement('li');

        container.innerHTML = markupHtml;

        document.getElementById('search-filters').append(container);
      });
    };

  },


  // OTHER FUNCTIONS -----------------------------------
  firstPaint: () => {
    console.log('=====\nApp Search === first paint\n');
    let _this = app.search;

    fetch(app.search.API_SEARCH)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Something went wrong');
      })
      .then((data) => {
        _this.DATA = data;
        _this.setupLayout();
        console.log(_this.DATA);
      })
      .catch((error) => {
        console.log(error)
        _this.DATA = data;
      });
  }
};
