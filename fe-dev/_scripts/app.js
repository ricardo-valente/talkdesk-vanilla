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
    if ($doc.querySelector('#search__form')) {
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
