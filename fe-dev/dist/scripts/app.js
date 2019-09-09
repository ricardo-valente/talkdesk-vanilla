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

  setupEvents: () => { },
  setupLayout: () => { },

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
    if (navigator.appVersion.indexOf("Win") !== -1) { res = "Windows"; }
    else if (navigator.appVersion.indexOf("Mac") !== -1) { res = "MacOS"; }
    else if (navigator.appVersion.indexOf("X11") !== -1) { res = "UNIX"; }
    else if (navigator.appVersion.indexOf("Linux") !== -1) { res = "Linux"; }

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
    if (type === 'int') {
      min = Math.ceil(min);
      max = Math.floor(max);

      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    else {
      return Math.random() * (max - min) + min;
    }
  },

  /**
   * Get the closest matching element up the DOM tree.
   * @private
   * @param  {Element} elem     Starting element
   * @param  {String}  selector Selector to match against
   * @return {Boolean|Element}  Returns null if not match found
   */
  getClosest: (elem, selector) => {
    // Element.matches() polyfill
    if (!Element.prototype.matches) {
      Element.prototype.matches =
        Element.prototype.matchesSelector ||
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.oMatchesSelector ||
        Element.prototype.webkitMatchesSelector ||
        function (s) {
          var matches = (this.document || this.ownerDocument).querySelectorAll(s),
            i = matches.length;
          while (--i >= 0 && matches.item(i) !== this) { }
          return i > -1;
        };
    }

    // Get closest match
    for (; elem && elem !== document; elem = elem.parentNode) {
      if (elem.matches(selector)) return elem;
    }

    return null;
  },

  paginate: (totalItems, currentPage = 1, pageSize = 10, maxPages = 10) => {
    // calculate total pages
    let totalPages = Math.ceil(totalItems / pageSize);

    // ensure current page isn't out of range
    if (currentPage < 1) {
      currentPage = 1;
    } else if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    let startPage, endPage;
    if (totalPages <= maxPages) {
      // total pages less than max so show all pages
      startPage = 1;
      endPage = totalPages;
    } else {
      // total pages more than max so calculate start and end pages
      let maxPagesBeforeCurrentPage = Math.floor(maxPages / 2);
      let maxPagesAfterCurrentPage = Math.ceil(maxPages / 2) - 1;
      if (currentPage <= maxPagesBeforeCurrentPage) {
        // current page near the start
        startPage = 1;
        endPage = maxPages;
      } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
        // current page near the end
        startPage = totalPages - maxPages + 1;
        endPage = totalPages;
      } else {
        // current page somewhere in the middle
        startPage = currentPage - maxPagesBeforeCurrentPage;
        endPage = currentPage + maxPagesAfterCurrentPage;
      }
    }

    // calculate start and end item indexes
    let startIndex = (currentPage - 1) * pageSize;
    let endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

    // create an array of pages to ng-repeat in the pager control
    let pages = Array.from(Array((endPage + 1) - startPage).keys()).map(i => startPage + i);

    // return object with all pager properties required by the view
    return {
      totalItems: totalItems,
      currentPage: currentPage,
      pageSize: pageSize,
      totalPages: totalPages,
      startPage: startPage,
      endPage: endPage,
      startIndex: startIndex,
      endIndex: endIndex,
      pages: pages
    };
  }
};

app.search = {
  // COMMON --------------------------------------------
  // Configs + Constants
  TIMERS: '',
  DATA: '',
  API_SEARCH: 'https://talkdesk-com.meza.talkdeskqa.com/wp-json/external/globalsearch/',
  // API_SEARCH: 'https://talkdesk.com/wp-json/external/globalsearch?search=Five9',
  // Pagination
  PAGE_SIZE: 10,
  PAGES_TO_SKIPE: 0,
  TOTAL_PAGES: 0,
  TOTAL_ITEMS: 0,
  CURRENT_PAGE: 1,
  // END Pagination


  // MAIN FUNCTIONS ------------------------------------
  init: () => {
    console.log('=====\napp Search Init\n');
    let _this = app.search;

    _this.getSearch((callback) => {
      _this.setupEvents();
      _this.setupLayout();
    });

  },

  setupEvents: () => {
    console.log('=====\napp Search === Events\n');
    let _this = app.search;

    _this.filtersHandler();
    _this.searchKeyword();
    _this.paginationHandler();
  },

  setupLayout: () => {
    console.log('=====\napp Search === layout\n');
    let _this = app.search;

    // Setup cards
    const cardsTemplate = (content, idx) => {
      return `
        <a href="${content.url}" class="" target="_self" title="${content.title}">
          <span class="card__label text-orange">${content.category}</span>
          <span class="card__label text-capitalize">${content.date}</span>
          <h4 class="card__title">${content.title}</h4>
          <p class="card__url">${content.url.replace(/^.*:\/\//i, '')}</p>
        </a>`
    };

    // Setup cards
    if (!!_this.DATA && _this.DATA.posts.length) {
      _this.PAGES_TO_SKIPE = _this.PAGE_SIZE * _this.CURRENT_PAGE;

      // console.log(_this.DATA.posts.slice(_this.PAGES_TO_SKIPE, -((_this.DATA.posts.length - _this.PAGE_SIZE) - _this.PAGES_TO_SKIPE)));

      _this.DATA.posts
        .slice(_this.PAGES_TO_SKIPE, -((_this.DATA.posts.length - _this.PAGE_SIZE) - _this.PAGES_TO_SKIPE))
        .map((content, idx) => {
          let markupHtml = cardsTemplate(content, idx);
          let container = document.createElement('div');

          container.className = 'col-12 card';
          container.innerHTML = markupHtml;

          document.getElementById('search-results--cards').append(container);
        });
    };

    // Setup Pagination
    if (!!_this.DATA && !!_this.DATA.posts.length) {
      let page = _this.CURRENT_PAGE;
      let pageSize = _this.PAGE_SIZE;
      let total = _this.TOTAL_PAGES = Math.ceil((_this.DATA.posts.length - pageSize) / pageSize);

      let markup = '';
      let container;

      if (total > 0) {
        // Previous Pages
        if (page - 2 > 0) {
          markup = `${page - 2}`;
          container = document.createElement('li');

          container.className = 'pagination__item';
          container.setAttribute('data-page', page - 2);
          container.innerHTML = markup;
          document.getElementById('pagination').appendChild(container);
        }

        if (page - 1 > 0) {
          markup = `${page - 1}`;
          container = document.createElement('li');

          container.className = 'pagination__item';
          container.setAttribute('data-page', page - 1);
          container.innerHTML = markup;
          document.getElementById('pagination').appendChild(container);
        }

        // Current Page
        markup = `${page}`;
        container = document.createElement('li');

        container.className = 'pagination__item pagination__item--active';
        container.setAttribute('data-page', page);
        container.innerHTML = markup;
        document.getElementById('pagination').appendChild(container);

        // Next Pages
        if (page + 1 <= total) {
          markup = `${page + 1}`;
          container = document.createElement('li');

          container.className = 'pagination__item';
          container.setAttribute('data-page', page + 1);
          container.innerHTML = markup;
          document.getElementById('pagination').appendChild(container);
        }
        if (page + 2 < total) {
          markup = `${page + 2}`;
          container = document.createElement('li');

          container.className = 'pagination__item';
          container.setAttribute('data-page', page + 2);
          container.innerHTML = markup;
          document.getElementById('pagination').appendChild(container);
        }
      }
    };
  },

  // OTHER FUNCTIONS -----------------------------------
  getSearch: (_callback) => {
    console.log('=====\napp Search === first paint\n');
    let _this = app.search;

    let callback = _callback;
    fetch(_this.API_SEARCH)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Something went wrong');
      })
      .then((data) => {
        _this.DATA = data;

        // Sort Posts by date desc
        _this.DATA.posts = _this.DATA.posts.sort((a, b) => {
          // Turn your strings into dates, and then subtract them
          // to get a value that is either negative, positive, or zero.
          return new Date(b.date) - new Date(a.date);
        });

        if (typeof callback === 'function') {
          callback();
        }
      })
      .catch((error) => {
        console.log(error)
        _this.DATA = data;
      });
  },

  searchHandler: () => {
    let form = document.getElementById('search__form');
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      console.log('submit search');
      var formData = serialize(form);

      console.log('form data', formData);
    });
  },

  filtersHandler: () => {
    document.addEventListener('click', (event) => {
      let $this = event.target;
      let $parent = $this.parentNode;
      let _this = app.search;

      if ($this.hasAttribute('data-filter')) {
        event.preventDefault();

        if ($parent.matches('.search__item') && !$parent.matches('.search__item--active')) {
          console.log('======\n Filters Handler ===', $this.getAttribute('data-filter'));

          // Reset Cards & Pagination
          document.getElementById('search-results--cards').innerHTML = '';
          document.getElementById('pagination').innerHTML = '';
          // END Reset Cards & Pagination

          const active = document.querySelector('.search__item--active');
          if (active) {
            active.classList.remove('search__item--active');
          }
          $parent.className = 'search__item search__item--active';

          // Setup cards
          if (!!_this.DATA && _this.DATA.posts.length) {
            _this.CURRENT_PAGE = 1;

            // Setup cards
            const cardsTemplate = (content, idx) => {
              return `
                <a href="${content.url}" class="" target="_self" title="${content.title}">
                  <span class="card__label text-orange">${content.category}</span>
                  <span class="card__label text-capitalize">${content.date}</span>
                  <h4 class="card__title">${content.title}</h4>
                  <p class="card__url">${content.url.replace(/^.*:\/\//i, '')}</p>
                </a>`
            };

            let _slug = $this.getAttribute('data-filter');
            _this.TOTAL_PAGES = 0;
            _this.TOTAL_ITEMS = 0;

            let dataObject = _this.DATA.posts;
            dataObject
              .filter((x) => {
                if (x.category === _slug) {
                  _this.TOTAL_ITEMS++;
                  _this.TOTAL_PAGES = (_this.TOTAL_ITEMS - _this.PAGE_SIZE) > 0 ? (_this.TOTAL_ITEMS - _this.PAGE_SIZE) / _this.PAGE_SIZE : 0;
                }
                return x.category === _slug
              })
              .slice(_this.PAGES_TO_SKIPE, -((_this.TOTAL_ITEMS - _this.PAGE_SIZE) - _this.PAGES_TO_SKIPE))
              .map((content, idx) => {
                let markupHtml = cardsTemplate(content, idx);
                let container = document.createElement('div');

                container.className = 'col-12 card';
                container.innerHTML = markupHtml;

                document.getElementById('search-results--cards').append(container);
              });
          };

          // Setup Pagination
          if (!!_this.TOTAL_ITEMS) {
            let page = parseInt(_this.CURRENT_PAGE);
            let pageSize = _this.PAGE_SIZE;
            let total = _this.TOTAL_PAGES = Math.ceil((_this.TOTAL_ITEMS - pageSize) / pageSize);

            let markup = '';
            let container;

            if (total > 0) {
              // Previous Pages
              if (page - 2 > 0) {
                markup = `${page - 2}`;
                container = document.createElement('li');

                container.className = 'pagination__item';
                container.setAttribute('data-page', page - 2);
                container.innerHTML = markup;
                document.getElementById('pagination').appendChild(container);
              }

              if (page - 1 > 0) {
                markup = `${page - 1}`;
                container = document.createElement('li');

                container.className = 'pagination__item';
                container.setAttribute('data-page', page - 1);
                container.innerHTML = markup;
                document.getElementById('pagination').appendChild(container);
              }

              // Current Page
              markup = `${page}`;
              container = document.createElement('li');

              container.className = 'pagination__item pagination__item--active';
              container.setAttribute('data-page', page);
              container.innerHTML = markup;
              document.getElementById('pagination').appendChild(container);

              // Next Pages
              if (page + 1 <= total) {
                markup = `${page + 1}`;
                container = document.createElement('li');

                container.className = 'pagination__item';
                container.setAttribute('data-page', page + 1);
                container.innerHTML = markup;
                document.getElementById('pagination').appendChild(container);
              }
              if (page + 2 < total) {
                markup = `${page + 2}`;
                container = document.createElement('li');

                container.className = 'pagination__item';
                container.setAttribute('data-page', page + 2);
                container.innerHTML = markup;
                document.getElementById('pagination').appendChild(container);
              }
            }
          };
        }
      }

    }, false);
  },

  searchKeyword: () => {
    document.addEventListener('click', (event) => {
      let $this = event.target;
      let formData = $this.serialize();

      console.log(formData);
    }, false);
  },

  paginationHandler: () => {
    document.addEventListener('click', (event) => {
      event.preventDefault();
      let _this = app.search;
      let $this = event.target;

      let _slug = document.querySelector('.search__item--active').children[0].getAttribute('data-filter');

      if ($this.matches('.pagination__item') && !$this.matches('.pagination__item--active')) {
        event.preventDefault();
        // Setup cards
        if (!!_this.DATA && _this.DATA.posts.length) {
          app.search.CURRENT_PAGE = $this.getAttribute('data-page');

          _this = app.search;

          // Setup cards
          const cardsTemplate = (content, idx) => {
            return `
            <a href="${content.url}" class="" target="_self" title="${content.title}">
              <span class="card__label text-orange">${content.category}</span>
              <span class="card__label text-capitalize">${content.date}</span>
              <h4 class="card__title">${content.title}</h4>
              <p class="card__url">${content.url.replace(/^.*:\/\//i, '')}</p>
            </a>`
          };

          // Reset Cards
          document.getElementById('search-results--cards').innerHTML = '';
          // END Reset Cards

          _this.PAGES_TO_SKIPE = _this.PAGE_SIZE * _this.CURRENT_PAGE;
          _this.TOTAL_PAGES = 0;
          _this.TOTAL_ITEMS = 0;

          let dataObject = _this.DATA.posts;
          dataObject
            .filter((x) => {
              if (x.category === _slug) {
                _this.TOTAL_ITEMS++;
                _this.TOTAL_PAGES = (_this.TOTAL_ITEMS - _this.PAGE_SIZE) > 0 ? (_this.TOTAL_ITEMS - _this.PAGE_SIZE) / _this.PAGE_SIZE : 0;
              }
              return x.category === _slug
            })
            .slice(_this.PAGES_TO_SKIPE, -((_this.TOTAL_ITEMS - _this.PAGE_SIZE) - _this.PAGES_TO_SKIPE))
            .map((content, idx) => {
              let markupHtml = cardsTemplate(content, idx);
              let container = document.createElement('div');

              container.className = 'col-12 card';
              container.innerHTML = markupHtml;

              document.getElementById('search-results--cards').append(container);
            });
        };

        // Setup Pagination
        if (!!_this.DATA && !!_this.DATA.posts.length) {
          let page = parseInt(_this.CURRENT_PAGE);
          let pageSize = _this.PAGE_SIZE;
          let total = _this.TOTAL_PAGES = Math.ceil((_this.DATA.posts.length - pageSize) / pageSize);

          let markup = '';
          let container;

          document.getElementById('pagination').innerHTML = '';

          if (total > 0) {
            // Previous Pages
            if (page - 2 > 0) {
              markup = `${page - 2}`;
              container = document.createElement('li');

              container.className = 'pagination__item';
              container.setAttribute('data-page', page - 2);
              container.innerHTML = markup;
              document.getElementById('pagination').appendChild(container);
            }

            if (page - 1 > 0) {
              markup = `${page - 1}`;
              container = document.createElement('li');

              container.className = 'pagination__item';
              container.setAttribute('data-page', page - 1);
              container.innerHTML = markup;
              document.getElementById('pagination').appendChild(container);
            }

            // Current Page
            markup = `${page}`;
            container = document.createElement('li');

            container.className = 'pagination__item pagination__item--active';
            container.setAttribute('data-page', page);
            container.innerHTML = markup;
            document.getElementById('pagination').appendChild(container);

            // Next Pages
            if (page + 1 <= total) {
              markup = `${page + 1}`;
              container = document.createElement('li');

              container.className = 'pagination__item';
              container.setAttribute('data-page', page + 1);
              container.innerHTML = markup;
              document.getElementById('pagination').appendChild(container);
            }
            if (page + 2 < total) {
              markup = `${page + 2}`;
              container = document.createElement('li');

              container.className = 'pagination__item';
              container.setAttribute('data-page', page + 2);
              container.innerHTML = markup;
              document.getElementById('pagination').appendChild(container);
            }
          }
        };
      }
    }, false);
  }
};