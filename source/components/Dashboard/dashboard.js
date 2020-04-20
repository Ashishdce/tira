import {
  createDOMElement
} from '../../utils/index.js';

(async () => {
  const res = await fetch('components/Dashboard/dashboard-template.html');
  const textTemplate = await res.text();

  // Parse and select the template tag here instead 
  // of adding it using innerHTML to avoid repeated parsing
  // and searching whenever a new instance of the component is added.
  const HTMLTemplate = new DOMParser().parseFromString(textTemplate, 'text/html').querySelector('template');

  class Dashboard extends HTMLElement {
    constructor() {
      super();

      this._state = null


      const shadowRoot = this.attachShadow({
        mode: 'open'
      });

      const instance = HTMLTemplate.content.cloneNode(true);
      shadowRoot.appendChild(instance);

      this.addEventListener('field-update', e => {
        if (!e.detail.type && e.detail.value) {
          this.dispatchEvent(new CustomEvent('save-dashboard-details', {
            bubbles: true,
            cancelable: false,
            composed: true,
            detail: {
              name: e.detail.value,
              updated: new Date().getTime()
            }
          }))
        } else if (e.detail.delete && !e.detail.type) {
          // delete action
          this.dispatchEvent(new CustomEvent('delete-dashboard', {
            bubbles: true,
            cancelable: false,
            composed: true
          }));
        }
      })
    }

    set state(data) {
      this._state = data;
      this.render();
    }

    get state() {
      return this._state;
    }

    connectedCallback() {
      this.render();
    }

    render() {

      const header = this.shadowRoot.querySelector('.dashboard__header');
      const listWrapper = this.shadowRoot.querySelector('.dashboard__list-wrapper');

      if (!this.state) {
        header.classList.add('no-dashboard-message');
        header.innerHTML = 'No Dashboard available';
        listWrapper.classList.add('no-dashboard-message');
        listWrapper.innerHTML = 'You can create a new one from the menu';
        return;
      }
      listWrapper.classList.remove('no-dashboard-message');
      header.classList.remove('no-dashboard-message');

      const listIds = this.state.listIds;

      header.innerHTML = `<tira-field value="${this.state.name}"></tira-field>`;

      listWrapper.innerHTML = '';

      const wrapper = document.createDocumentFragment();

      if (listIds && listIds.length) {
        listIds.forEach(id => {
          const listData = this.state.lists[id];
          const listELem = document.createElement('tira-list');
          listELem.setAttribute('list-id', listData.id);

          listELem.state = listData;

          wrapper.appendChild(listELem);
        });

        listWrapper.appendChild(wrapper);
      }
      listWrapper.appendChild(createDOMElement(
        'div',
        {
          class: 'dashboard__list-add-button'
        },
        `
          <div class="dashboard__button-message">
            ${listIds && listIds.length ? 'Create another list' : 'Create a list'}
          </div>
          <tira-button type='list'></tira-button>
        `
      ))
    }
  }

  customElements.define('tira-dashboard', Dashboard);
})();