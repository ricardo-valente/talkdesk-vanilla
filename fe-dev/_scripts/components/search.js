app.search = {
  // COMMON --------------------------------------------
  // Configs + Constants
  TIMERS: '',
  DATA: '',
  // API_SEARCH: 'https://talkdesk-com.meza.talkdeskqa.com/wp-json/external/globalsearch/',
  API_SEARCH: 'https://talkdesk.com/wp-json/external/globalsearch',
  // Pagination
  PAGE_SIZE: 10,
  PAGES_TO_SKIPE: 0,
  TOTAL_PAGES: 0,
  TOTAL_ITEMS: 0,
  CURRENT_PAGE: 1,
  // END Pagination
  CURRENT_DATA: '',
  KEYWORD: '',


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
    let _HELPERS = app.helpers;
    let _this = app.search;

    _this.filtersHandler();
    _this.paginationHandler();

    document.querySelector('form').addEventListener('change', (event) => {
      let $this = event.currentTarget;
      let formData = _HELPERS.serializeArray($this);

      _this.KEYWORD = formData[0].value;
      // console.log('=======\nSetup events\nnew keyword', _this.KEYWORD, '\n======');
    });
  },

  setupLayout: () => {
    console.log('=====\napp Search === layout\n');
    let _this = app.search;

    // Setup cards
    _this.renderCards();

    // Setup Pagination
    _this.renderPagination();

    document.getElementById('total-results').textContent = _this.CURRENT_DATA.length;
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

        if (typeof callback === 'function') {
          callback();
        }
      })
      .catch((error) => {
        console.log(error)
        _this.DATA = data;
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
          console.log('=====\nFilter Handler');
          console.log('active filter = "', $this.getAttribute('data-filter'), '"');

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
          _this.renderCards();

          // Setup Pagination
          _this.renderPagination();

          document.getElementById('total-results').textContent = _this.TOTAL_ITEMS || _this.CURRENT_DATA.length;

          console.log('total pages = "', _this.TOTAL_PAGES, '"');
          console.log('total items = "', _this.TOTAL_ITEMS || _this.CURRENT_DATA.length, '"\n======');
        }
      }

    }, false);
  },

  paginationHandler: () => {
    document.addEventListener('click', (event) => {
      let _this = app.search;
      let $this = event.target;

      if ($this.hasAttribute('data-page')) {
        event.preventDefault();

        let _slug = document.querySelector('.search__item--active').children[0].getAttribute('data-filter');

        if (
          ($this.matches('.pagination__item') && !$this.matches('.pagination__item--active')) ||
          ($this.hasAttribute('data-page') && $this.matches('.button'))
        ) {
          event.preventDefault();

          if (!!_this.DATA && !!_this.DATA.posts || !!_this.CURRENT_DATA) {
            console.log('==== !!!!!!!! ====\n', _this.CURRENT_PAGE === $this.getAttribute('data-page'), '\n==== !!!!!!!! ====');

            if ($this.getAttribute('data-page') !== 'next' && $this.getAttribute('data-page') !== 'prev') {
              _this.CURRENT_PAGE = parseInt($this.getAttribute('data-page'), 10);
            } else if ($this.getAttribute('data-page') === 'next') {
              console.log('next');
              _this.CURRENT_PAGE = _this.CURRENT_PAGE + 1;
            } else if ($this.getAttribute('data-page') === 'prev') {
              console.log('prev');
              _this.CURRENT_PAGE = _this.CURRENT_PAGE - 1;
            }

            // Reset Cards
            document.getElementById('search-results--cards').innerHTML = '';
            document.getElementById('pagination').innerHTML = '';
            // END Reset Cards

            _this.PAGES_TO_SKIPE = _this.PAGE_SIZE * _this.CURRENT_PAGE;

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

            let dataObject = _this.CURRENT_DATA;
            if (_slug === '*') {
              _this.TOTAL_PAGES = ((_this.DATA.posts.length - _this.PAGE_SIZE) / _this.PAGE_SIZE).toFixed();
              _this.TOTAL_ITEMS = _this.DATA.posts.length;
              dataObject
                .slice(_this.PAGES_TO_SKIPE, -((_this.DATA.posts.length - _this.PAGE_SIZE) - _this.PAGES_TO_SKIPE))
                .map((content, idx) => {
                  let markupHtml = cardsTemplate(content, idx);
                  let container = document.createElement('div');

                  container.className = 'col-12 card';
                  container.innerHTML = markupHtml;

                  document.getElementById('search-results--cards').append(container);
                });
            } else {
              _this.TOTAL_PAGES = 0;
              _this.TOTAL_ITEMS = 0;

              dataObject
                .filter((item) => {
                  if (item.category === _slug) {
                    _this.TOTAL_ITEMS++;
                    _this.TOTAL_PAGES = (_this.TOTAL_ITEMS - _this.PAGE_SIZE) > 0 ? ((_this.TOTAL_ITEMS - _this.PAGE_SIZE) / _this.PAGE_SIZE).toFixed() : 0;
                  }

                  return item.category === _slug
                })
                .slice(_this.PAGES_TO_SKIPE, -((_this.TOTAL_ITEMS - _this.PAGE_SIZE) - _this.PAGES_TO_SKIPE))
                .map((content, idx) => {
                  let markupHtml = cardsTemplate(content, idx);
                  let container = document.createElement('div');

                  container.className = 'col-12 card';
                  container.innerHTML = markupHtml;

                  document.getElementById('search-results--cards').append(container);
                });
            }
            //END Setup cards

            // Setup Pagination
            let markup = '';
            let container;

            if (_this.TOTAL_PAGES > 1) {
              document.querySelector('.pagination').classList = 'pagination';

              // Prev button
              if (_this.CURRENT_PAGE > 3) {
                markup = `1`;
                container = document.createElement('li');

                container.className = 'pagination__item bananas';
                container.setAttribute('data-page', 1);
                container.innerHTML = markup;
                document.getElementById('pagination').appendChild(container);
              }

              if (_this.CURRENT_PAGE > 3) {
                markup = `...`;
                container = document.createElement('li');

                container.className = 'pagination__item bananas';
                container.innerHTML = markup;
                document.getElementById('pagination').appendChild(container);
              }

              if (_this.CURRENT_PAGE > 1) {
                document.querySelector('.button[data-page="prev"').classList = 'button button--prev';
              } else {
                document.querySelector('.button[data-page="prev"').classList = 'button button--prev invisible';
              }

              // Previous Pages
              if (_this.CURRENT_PAGE - 2 > 0) {
                markup = `${_this.CURRENT_PAGE - 2}`;
                container = document.createElement('li');

                container.className = 'pagination__item';
                container.setAttribute('data-page', _this.CURRENT_PAGE - 2);
                container.innerHTML = markup;
                document.getElementById('pagination').appendChild(container);
              }

              if (_this.CURRENT_PAGE - 1 > 0) {
                markup = `${_this.CURRENT_PAGE - 1}`;
                container = document.createElement('li');

                container.className = 'pagination__item';
                container.setAttribute('data-page', _this.CURRENT_PAGE - 1);
                container.innerHTML = markup;
                document.getElementById('pagination').appendChild(container);
              }

              // Current Page
              markup = `${_this.CURRENT_PAGE}`;
              container = document.createElement('li');

              container.className = 'pagination__item pagination__item--active';
              container.setAttribute('data-page', _this.CURRENT_PAGE);
              container.innerHTML = markup;
              document.getElementById('pagination').appendChild(container);

              // Next Pages
              if (_this.CURRENT_PAGE + 1 <= _this.TOTAL_PAGES) {
                markup = `${_this.CURRENT_PAGE + 1}`;
                container = document.createElement('li');

                container.className = 'pagination__item';
                container.setAttribute('data-page', _this.CURRENT_PAGE + 1);
                container.innerHTML = markup;
                document.getElementById('pagination').appendChild(container);
              }

              if (_this.CURRENT_PAGE + 2 < _this.TOTAL_PAGES) {
                markup = `${_this.CURRENT_PAGE + 2}`;
                container = document.createElement('li');

                container.className = 'pagination__item';
                container.setAttribute('data-page', _this.CURRENT_PAGE + 2);
                container.innerHTML = markup;
                document.getElementById('pagination').appendChild(container);
              }

              if (_this.CURRENT_PAGE + 3 < _this.TOTAL_PAGES) {
                markup = `...`;
                container = document.createElement('li');

                container.className = 'pagination__item';
                container.innerHTML = markup;
                document.getElementById('pagination').appendChild(container);
              }

              if (_this.CURRENT_PAGE + 3 < _this.TOTAL_PAGES) {
                markup = `${_this.TOTAL_PAGES}`;
                container = document.createElement('li');

                container.className = 'pagination__item';
                container.setAttribute('data-page', _this.TOTAL_PAGES);
                container.innerHTML = markup;
                document.getElementById('pagination').appendChild(container);
              }

              // next button
              if (_this.CURRENT_PAGE < _this.TOTAL_PAGES) {
                document.querySelector('.button[data-page="next"').classList = 'button button--next';
              } else {
                document.querySelector('.button[data-page="next"').classList = 'button button--next invisible';
              }
            } else {
              document.querySelector('.pagination').classList = 'pagination hidden';
            }
            // END Setup pagination
          };

          document.getElementById('total-results').textContent = _this.TOTAL_ITEMS;

          console.log('=====\nPagination Handler');
          console.log('active page = "', _this.CURRENT_PAGE, '"');
          console.log('filter used = "', _slug, '"');
          console.log('total pages = "', _this.TOTAL_PAGES, '"');
          console.log('total items = "', _this.TOTAL_ITEMS, '"\n======');
        }
      }
    }, false);
  },

  searchHandler: (event) => {
    console.log('=====\nSearch Keyword');

    event.preventDefault();
    let HELPERS = app.helpers;
    let _this = app.search;

    let form = document.getElementById('search__form');
    let formData = HELPERS.serializeArray(form);
    _this.KEYWORD = formData[0].value;

    // Setup cards
    _this.renderCards();

    // Setup Pagination
    _this.renderPagination();

    console.log('pages to skipe = "', _this.PAGES_TO_SKIPE, '"');
    console.log('total pages = "', _this.TOTAL_PAGES, '"');
    console.log('total items = "', _this.TOTAL_ITEMS, '"');
    console.log('active page = "', !!document.querySelector('.pagination__item--active') ? document.querySelector('.pagination__item--active').getAttribute('data-page') : 'N/A', '"\n======');

    document.getElementById('keyword').textContent = _this.KEYWORD;
    document.getElementById('total-results').textContent = _this.TOTAL_ITEMS;
  },

  // RENDER PAGINATION & CARDS
  renderPagination: () => {
    let _this = app.search;

    // Reset Cards & Pagination
    document.getElementById('pagination').innerHTML = '';
    // END Reset Cards & Pagination

    // Setup Pagination
    if (_this.TOTAL_PAGES > 1) {
      document.querySelector('.pagination').classList = 'pagination';

      // Prev button
      if (_this.CURRENT_PAGE > 1) {
        document.querySelector('.button[data-page="prev"]').classList = 'button button--prev';
      } else {
        document.querySelector('.button[data-page="prev"]').classList = 'button button--prev invisible';
      }

      // Previous Pages
      if (_this.CURRENT_PAGE > 3) {
        markup = `1`;
        container = document.createElement('li');

        container.className = 'pagination__item bananas';
        container.setAttribute('data-page', 1);
        container.innerHTML = markup;
        document.getElementById('pagination').appendChild(container);
      }

      if (_this.CURRENT_PAGE > 3) {
        markup = `...`;
        container = document.createElement('li');

        container.className = 'pagination__item bananas';
        container.innerHTML = markup;
        document.getElementById('pagination').appendChild(container);
      }

      if (_this.CURRENT_PAGE - 2 > 0) {
        markup = `${_this.CURRENT_PAGE - 2}`;
        container = document.createElement('li');

        container.className = 'pagination__item';
        container.setAttribute('data-page', _this.CURRENT_PAGE - 2);
        container.innerHTML = markup;
        document.getElementById('pagination').appendChild(container);
      }

      if (_this.CURRENT_PAGE - 1 > 0) {
        markup = `${_this.CURRENT_PAGE - 1}`;
        container = document.createElement('li');

        container.className = 'pagination__item';
        container.setAttribute('data-page', _this.CURRENT_PAGE - 1);
        container.innerHTML = markup;
        document.getElementById('pagination').appendChild(container);
      }

      // Current Page
      markup = `${_this.CURRENT_PAGE}`;
      container = document.createElement('li');

      container.className = 'pagination__item pagination__item--active';
      container.setAttribute('data-page', _this.CURRENT_PAGE);
      container.innerHTML = markup;
      document.getElementById('pagination').appendChild(container);

      // Next Pages
      if (_this.CURRENT_PAGE + 1 <= _this.TOTAL_PAGES) {
        markup = `${_this.CURRENT_PAGE + 1}`;
        container = document.createElement('li');

        container.className = 'pagination__item';
        container.setAttribute('data-page', _this.CURRENT_PAGE + 1);
        container.innerHTML = markup;
        document.getElementById('pagination').appendChild(container);
      }

      if (_this.CURRENT_PAGE + 2 < _this.TOTAL_PAGES) {
        markup = `${_this.CURRENT_PAGE + 2}`;
        container = document.createElement('li');

        container.className = 'pagination__item';
        container.setAttribute('data-page', _this.CURRENT_PAGE + 2);
        container.innerHTML = markup;
        document.getElementById('pagination').appendChild(container);
      }

      if (_this.CURRENT_PAGE + 3 < _this.TOTAL_PAGES) {
        markup = `...`;
        container = document.createElement('li');

        container.className = 'pagination__item';
        container.innerHTML = markup;
        document.getElementById('pagination').appendChild(container);
      }

      if (_this.CURRENT_PAGE + 3 < _this.TOTAL_PAGES) {
        markup = `${_this.TOTAL_PAGES}`;
        container = document.createElement('li');

        container.className = 'pagination__item';
        container.setAttribute('data-page', _this.TOTAL_PAGES);
        container.innerHTML = markup;
        document.getElementById('pagination').appendChild(container);
      }

      // next button
      if (_this.CURRENT_PAGE < _this.TOTAL_PAGES) {
        document.querySelector('.button[data-page="next"]').classList = 'button button--next';
      } else {
        document.querySelector('.button[data-page="next"]').classList = 'button button--next invisible';
      }
    } else {
      document.querySelector('.pagination').classList = 'pagination hidden';
    }
    // END Setup pagination
  },

  renderCards: () => {
    let _this = app.search;

    // Reset Cards & Pagination
    document.getElementById('search-results--cards').innerHTML = '';
    // END Reset Cards & Pagination

    // Setup cards
    if (!!_this.DATA && _this.DATA.posts.length) {
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

      let _category = document.querySelector('.search__item--active').children[0].getAttribute('data-filter') === '*' ? false : document.querySelector('.search__item--active').children[0].getAttribute('data-filter');
      console.log('category = ', _category);

      _this.CURRENT_PAGE = 1;
      _this.TOTAL_PAGES = 0;
      _this.TOTAL_ITEMS = 0;
      _this.PAGES_TO_SKIPE = 0;

      _this.CURRENT_DATA = _this.DATA.posts
        .filter((item) => {
          if (!!_category) { // Has Category difernent than All '*'
            if (!!_this.KEYWORD) { // Has Keyword
              if (item.category === _category && item.title.toLowerCase().indexOf(_this.KEYWORD.toLowerCase()) != -1) {
                _this.TOTAL_ITEMS++;
                _this.TOTAL_PAGES = (_this.TOTAL_ITEMS - _this.PAGE_SIZE) > 0 ? ((_this.TOTAL_ITEMS - _this.PAGE_SIZE) / _this.PAGE_SIZE).toFixed() : 0;
                return item;
              }
            } else { // No Keyword with Category
              if (item.category === _category) {
                _this.TOTAL_ITEMS++;
                _this.TOTAL_PAGES = (_this.TOTAL_ITEMS - _this.PAGE_SIZE) > 0 ? ((_this.TOTAL_ITEMS - _this.PAGE_SIZE) / _this.PAGE_SIZE).toFixed() : 0;
                return item;
              }
            }
          } else { // All Category
            if (!!_this.KEYWORD) { // Has Keyword
              if (item.title.toLowerCase().indexOf(_this.KEYWORD.toLowerCase()) != -1) {
                _this.TOTAL_ITEMS++;
                _this.TOTAL_PAGES = (_this.TOTAL_ITEMS - _this.PAGE_SIZE) > 0 ? ((_this.TOTAL_ITEMS - _this.PAGE_SIZE) / _this.PAGE_SIZE).toFixed() : 0;
                return item;
              }
            } else { // No Keyword & no Category
              _this.TOTAL_ITEMS++;
              _this.TOTAL_PAGES = (_this.TOTAL_ITEMS - _this.PAGE_SIZE) > 0 ? ((_this.TOTAL_ITEMS - _this.PAGE_SIZE) / _this.PAGE_SIZE).toFixed() : 0;
              return item;
            }
          }
        });

      // Append DATA to RESTULS
      _this.CURRENT_DATA
        .slice(_this.PAGES_TO_SKIPE, -((_this.TOTAL_ITEMS - _this.PAGE_SIZE) - _this.PAGES_TO_SKIPE))
        .map((content, idx) => {
          let markupHtml = cardsTemplate(content, idx);
          let container = document.createElement('div');

          container.className = 'col-12 card';
          container.innerHTML = markupHtml;

          document.getElementById('search-results--cards').append(container);
        });

      console.log('current data = ', _this.CURRENT_DATA);
    };
    // END Setup cards
  }
};
