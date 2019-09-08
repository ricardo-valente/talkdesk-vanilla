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

    // // Setup filters
    // const filtersTemplate = (content, idx) => {
    //   return `<span data-filter="${content.slug}">${content.label}</span>`;
    // };

    // if (!!_this.DATA && _this.DATA.posts.length) {
    //   _this.DATA.menu.map((content, idx) => {
    //     let markupHtml = filtersTemplate(content, idx);
    //     let container = document.createElement('li');

    //     container.className = 'search__item';
    //     container.innerHTML = markupHtml;

    //     document.getElementById('search-filters').append(container);
    //   });
    // };

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
