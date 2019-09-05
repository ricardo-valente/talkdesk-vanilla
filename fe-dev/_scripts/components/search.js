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
