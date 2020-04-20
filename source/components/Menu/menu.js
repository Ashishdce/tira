import {
  createDOMElement
} from '../../utils/index.js';

(async () => {
  const res = await fetch('components/Menu/template.html');
  const textTemplate = await res.text();

  const HTMLTemplate = new DOMParser().parseFromString(textTemplate, 'text/html').querySelector('template');

  class Menu extends HTMLElement {
    constructor() {
      super();

      this._state = {
        open: false
      }

      const shadowRoot = this.attachShadow({
        mode: 'open'
      });
      const instance = HTMLTemplate.content.cloneNode(true);
      shadowRoot.appendChild(instance);

      this.menuButton = this.shadowRoot.querySelector('.menu__menu-button');
      this.addDashboardButton = this.shadowRoot.querySelector('.menu__create-dashboard-button');
      this.menuListWrapper = this.shadowRoot.querySelector('.menu__list-wrapper');

      this.menuButton.addEventListener('click', e => {
        const isMenuOpen = this.state.open;
        if (isMenuOpen) {
          this.menuButton.querySelector('.svg-close').setAttribute('hidden', 'true');
          this.menuButton.querySelector('.svg-menu').removeAttribute('hidden');
        } else {
          this.menuButton.querySelector('.svg-close').removeAttribute('hidden');
          this.menuButton.querySelector('.svg-menu').setAttribute('hidden', 'true');
        }
        this.state = {
          open: !isMenuOpen
        };

        this.dispatchEvent(new CustomEvent('menu-toggle', {
          bubbles: true,
          detail: {
            open: !isMenuOpen
          }
        }));
      });

      this.addDashboardButton.addEventListener('click', e => {
        this.dispatchEvent(new CustomEvent('new-dashboard', {
          bubbles: true,
          cancelable: false,
          composed: true
        }));
      });

      this.menuListWrapper.addEventListener('click', e => {
        if (e.target.classList.contains('menu__item') && e.target.dataset.id) {
          console.log(e.target.dataset.id);
          this.dispatchEvent(new CustomEvent('dashboard-selected', {
            bubbles: true,
            cancelable: false,
            composed: true,
            detail: {
              selectedId: e.target.dataset.id
            }
          }))
        }
      })
    }

    set state(data) {
      this._state = {
        ...this._state,
        ...data
      };
      this.render();
    }

    get state() {
      return this._state;
    }

    connectedCallback() {
      this.render();
    }

    getElementsByTagName(name) {
      return this.state.open ? name : name.split(' ').map(item => item[0].toUpperCase()).join('');
    }

    render = () => {
      this.menuListWrapper.innerHTML = '';

      const dashboardsIds = this.state.dashboardIds;
      const itemWrapperFragment = document.createDocumentFragment();

      if (!this.state.open) {
        this.addDashboardButton.classList.add('closed');
        this.addDashboardButton.querySelector('.menu__button-text').setAttribute('hidden', 'true');
      } else {
        this.addDashboardButton.classList.remove('closed');
        this.addDashboardButton.querySelector('.menu__button-text').removeAttribute('hidden');
      }

      if (dashboardsIds && dashboardsIds.length) {
        this.menuListWrapper.removeAttribute('hidden');
        dashboardsIds.forEach(item => {

          const dashboardData = this.state.dashboards[item];

          const itemElem = createDOMElement('div', {
            class: `menu__item ${!this.state.open ? 'closed' : ''} ${dashboardData.id === this.state.selected ? 'selected' : ''}`,
            'data-id': dashboardData.id,
            role: 'button'
          }, this.getElementsByTagName(dashboardData.name));

          itemWrapperFragment.appendChild(itemElem);
        });
      } else {
        this.menuListWrapper.setAttribute('hidden', 'true');
      }

      this.menuListWrapper.appendChild(itemWrapperFragment);
    }
  }

  customElements.define('tira-menu', Menu);
})();