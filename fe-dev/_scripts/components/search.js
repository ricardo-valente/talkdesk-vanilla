app.search = {
  // COMMON --------------------------------------------
  // Configs + Constants
  TIMERS: '',
  DATA: '',
  API_SEARCH: 'https://talkdesk-com.meza.talkdeskqa.com/wp-json/external/globalsearch/',
  // API_SEARCH: 'https://talkdesk.com/wp-json/external/globalsearch',
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
    const cardsTemplate = (content, idx) => {
      let title = !!content.title ? content.title : '';
      let url = !!content.url ? content.url : '#';
      let category = !!content.category ? content.category : '';
      let date = !!content.date && content.date !== null? content.date : '';
      let urlText = !!content.url ? content.url.replace(/^.*:\/\//i, '') : '';

      return `
        <a href="${url}" class="" target="_self" title="${title}">
          <span class="card__label text-orange">${category}</span>
          <span class="card__label text-capitalize">${date}</span>
          <h4 class="card__title">${title}</h4>
          <p class="card__url">${urlText}</p>
        </a>`
    };

    // Setup cards
    if (!!_this.DATA && _this.DATA.posts.length) {
      _this.CURRENT_DATA = _this.DATA.posts;

      _this.CURRENT_DATA
        .sort((a, b) => {
          // console.log('sort');
          // Turn your strings into dates, and then subtract them
          // to get a value that is either negative, positive, or zero.

          return new Date(b.date) - new Date(a.date);
        })
        .slice(_this.PAGES_TO_SKIPE, -((_this.CURRENT_DATA.length - _this.PAGE_SIZE) - _this.PAGES_TO_SKIPE))
        .map((content, idx) => {
          // console.log('map');
          let markupHtml = cardsTemplate(content, idx);
          let container = document.createElement('div');

          container.className = 'col-12 card';
          container.innerHTML = markupHtml;

          document.getElementById('search-results--cards').append(container);
        });

      // console.log(_this.CURRENT_DATA);
    };

    // Setup Pagination
    if (!!_this.DATA && !!_this.CURRENT_DATA) {
      _this.TOTAL_PAGES = ((_this.CURRENT_DATA.length) / _this.PAGE_SIZE).toFixed();

      let markup = '';
      let container;

      if (_this.TOTAL_PAGES > 1) {
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
      }
    };

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
          if (!!_this.DATA && _this.DATA.posts.length) {
            // Setup cards
            const cardsTemplate = (content, idx) => {
              let title = !!content.title ? content.title : '';
              let url = !!content.url ? content.url : '#';
              let category = !!content.category ? content.category : '';
              let date = !!content.date && content.date !== null ? content.date : '';
              let urlText = !!content.url ? content.url.replace(/^.*:\/\//i, '') : '';

              return `
                <a href="${url}" class="" target="_self" title="${title}">
                  <span class="card__label text-orange">${category}</span>
                  <span class="card__label text-capitalize">${date}</span>
                  <h4 class="card__title">${title}</h4>
                  <p class="card__url">${urlText}</p>
                </a>`
            };

            let _category = $this.getAttribute('data-filter') === '*' ? false : $this.getAttribute('data-filter');

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

          // Setup Pagination
          if (!!_this.TOTAL_ITEMS) {
            let page = parseInt(_this.CURRENT_PAGE);
            let pageSize = _this.PAGE_SIZE;
            let total = _this.TOTAL_PAGES = ((_this.TOTAL_ITEMS - pageSize) / pageSize).toFixed();

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

        if ($this.matches('.pagination__item') && !$this.matches('.pagination__item--active')) {
          event.preventDefault();

          if (!!_this.DATA && !!_this.DATA.posts || !!_this.CURRENT_DATA) {
            _this.CURRENT_PAGE = $this.getAttribute('data-page');

            // Reset Cards
            document.getElementById('search-results--cards').innerHTML = '';
            document.getElementById('pagination').innerHTML = '';
            // END Reset Cards

            _this.PAGES_TO_SKIPE = _this.PAGE_SIZE * _this.CURRENT_PAGE;

            // Setup cards
            const cardsTemplate = (content, idx) => {
              let title = !!content.title ? content.title : '';
              let url = !!content.url ? content.url : '#';
              let category = !!content.category ? content.category : '';
              let date = !!content.date && content.date !== null ? content.date : '';
              let urlText = !!content.url ? content.url.replace(/^.*:\/\//i, '') : '';

              return `
                <a href="${url}" class="" target="_self" title="${title}">
                  <span class="card__label text-orange">${category}</span>
                  <span class="card__label text-capitalize">${date}</span>
                  <h4 class="card__title">${title}</h4>
                  <p class="card__url">${urlText}</p>
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
            _this.CURRENT_PAGE = parseInt($this.getAttribute('data-page'));
            let total = _this.TOTAL_PAGES;

            let markup = '';
            let container;

            if (_this.TOTAL_PAGES > 0) {
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
              if (_this.CURRENT_PAGE + 1 <= total) {
                markup = `${_this.CURRENT_PAGE + 1}`;
                container = document.createElement('li');

                container.className = 'pagination__item';
                container.setAttribute('data-page', _this.CURRENT_PAGE + 1);
                container.innerHTML = markup;
                document.getElementById('pagination').appendChild(container);
              }

              if (_this.CURRENT_PAGE + 2 <= total) {
                markup = `${_this.CURRENT_PAGE + 2}`;
                container = document.createElement('li');

                container.className = 'pagination__item';
                container.setAttribute('data-page', _this.CURRENT_PAGE + 2);
                container.innerHTML = markup;
                document.getElementById('pagination').appendChild(container);
              }
            }
            // END Setup pagination
          };

          document.getElementById('total-results').textContent = _this.TOTAL_ITEMS;

          console.log('=====\nPagination Handler');
          console.log('active page = "', $this.getAttribute('data-page'), '"');
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

    // Reset Cards & Pagination
    document.getElementById('search-results--cards').innerHTML = '';
    document.getElementById('pagination').innerHTML = '';
    // END Reset Cards & Pagination

    // Setup cards
    if (!!_this.DATA && _this.DATA.posts.length) {
      // Setup cards
      const cardsTemplate = (content, idx) => {
        let title = !!content.title ? content.title : '';
        let url = !!content.url ? content.url : '#';
        let category = !!content.category ? content.category : '';
        let date = !!content.date && content.date !== null ? content.date : '';
        let urlText = !!content.url ? content.url.replace(/^.*:\/\//i, '') : '';

        return `
          <a href="${url}" class="" target="_self" title="${title}">
            <span class="card__label text-orange">${category}</span>
            <span class="card__label text-capitalize">${date}</span>
            <h4 class="card__title">${title}</h4>
            <p class="card__url">${urlText}</p>
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

    // Setup Pagination
    if (_this.TOTAL_PAGES > 1) {
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
    }
    // END Setup pagination

    console.log('pages to skipe = "', _this.PAGES_TO_SKIPE, '"');
    console.log('total pages = "', _this.TOTAL_PAGES, '"');
    console.log('total items = "', _this.TOTAL_ITEMS, '"');
    console.log('active page = "', !!document.querySelector('.pagination__item--active') ? document.querySelector('.pagination__item--active').getAttribute('data-page') : 'N/A', '"\n======');

    document.getElementById('keyword').textContent = _this.KEYWORD;
    document.getElementById('total-results').textContent = _this.TOTAL_ITEMS;
  }
};
