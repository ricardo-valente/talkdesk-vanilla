app.search = {
  // COMMON --------------------------------------------
  // Configs + Constants
  TIMERS: '',
  DATA: '',
  API_SEARCH: 'https://talkdesk-com.meza.talkdeskqa.com/wp-json/external/globalsearch',
  PAGE_SKIP: 0,
  PAGE_SIZE: 12,



  // MAIN FUNCTIONS ------------------------------------
  init: () => {
    console.log('=====\nApp Search Init\n');
    let _this = app.search;

    _this.firstPaint((callback) => {
      _this.setupEvents();
      _this.setupLayout();
    });

  },

  setupEvents: () => {
    console.log('=====\nApp Search === Events\n');
    let _this = app.search;

    _this.filtersHandler();
    _this.paginationHandler();
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
      _this.DATA.posts.slice(_this.PAGE_SKIP, _this.PAGE_SIZE).map((content, idx) => {
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
        <a href="#" data-filter="${content.slug}">${content.label}</a>
      `
    };

    if (!!_this.DATA && _this.DATA.posts.length) {
      _this.DATA.menu.map((content, idx) => {
        let markupHtml = filtersTemplate(content, idx);
        let container = document.createElement('li');

        container.className = 'search__item';
        container.innerHTML = markupHtml;

        document.getElementById('search-filters').append(container);
      });
    };

  },


  // OTHER FUNCTIONS -----------------------------------
  firstPaint: (_callback) => {
    console.log('=====\nApp Search === first paint\n');
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

        if (typeof callback === 'function') {
          callback();
        }
        console.log(_this.DATA);
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
      var _this = event.target;
      var _parent = _this.parentNode;

      if (_this.matches('.search__item')) {
        event.preventDefault();
        if (_this.querySelector('a').hasAttribute('data-filter'))
          console.log(_this.querySelector('a').getAttribute('data-filter'));
      } else if (_this.hasAttribute('data-filter')) {
        event.preventDefault();
        if (_parent.matches('.search__item'))
          console.log(_this.getAttribute('data-filter'));
      }

    }, false);
  },

  paginationHandler: () => {
    document.addEventListener('click', (event) => {

      var _this = event.target;
      var _parent = _this.parentNode;

      if (!!_this.DATA && !!_this.DATA.posts.length) {
        let totalPosts = _this.DATA.posts.length;
        let totalPages = (totalPosts - _this.PAGE_SIZE) <= 0 ? 0 : ((totalPosts - _this.PAGE_SIZE) / _this.PAGE_SIZE).toFixed();
        console.log('total pages', totalPages);
      }

      // If the clicked element doesn't have the right selector, bail
      if (_this.matches('.pagination--item')) {
        // Don't follow the link
        event.preventDefault();
        // Log the clicked element in the console
        console.log(event.target.getAttribute('data-page'));



      }
    }, false);
  }
};
