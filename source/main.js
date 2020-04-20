import store from './store/index.js';

import './components/Menu/menu.js'
import './components/Card/card.js';
import './components/List/list.js';
import './components/Dashboard/dashboard.js'
import './components/Button/button.js'
import './components/EditableField/editableField.js'

class App {
  constructor() {

    this.state = store.getState();
    store.subscribe(this.render);

    this.appContainer = document.querySelector('.app-container');

    this.appContainer.addEventListener('menu-toggle', (e) => {
      const {
        open
      } = e.detail;

      if (open) {
        this.appContainer.classList.add('show-menu');
      } else {
        this.appContainer.classList.remove('show-menu');
      }
    })

    this.appContainer.addEventListener('add-button-clicked', (e) => {
      console.log('Add button clicked');
      console.log(e.detail.type)
      const type = e.detail.type;
      if (type === 'card') {
        // create a card in the list with list id sent
        const listId = e.detail.id;
        store.dispatch({
          type: 'CREATE_TASK',
          data: {
            id: listId
          }
        });
      } else {
        // create a list in the selected dashboard
        store.dispatch({
          type: 'CREATE_LIST',
          data: {
            id: this.state.selected
          }
        });
      }
    });

    this.appContainer.addEventListener('dashboard-selected', (e) => {
      const {
        selectedId
      } = e.detail;

      console.log('Selected dsahboard :', selectedId);

      store.dispatch({
        type: 'SELECTED_DASHBOARD',
        id: Number(selectedId)
      });
    });
    this.appContainer.addEventListener('save-task-details', (e) => {

      console.log('Save card details');

      store.dispatch({
        type: 'SAVE_TASK_DETAILS',
        data: {
          ...e.detail
        }
      });
    });

    this.appContainer.addEventListener('new-dashboard', (e) => {
      store.dispatch({
        type: 'CREATE_DASHBOARD'
      });
    });

    this.appContainer.addEventListener('save-dashboard-details', (e) => {
      store.dispatch({
        type: 'SAVE_DASHBOARD_DETAILS',
        data: {
          ...e.detail
        }
      });
    });

    this.appContainer.addEventListener('save-list-details', (e) => {
      store.dispatch({
        type: 'SAVE_LIST_DETAILS',
        data: {
          ...e.detail
        }
      });
    });

    this.appContainer.addEventListener('delete-dashboard', (e) => {
      store.dispatch({
        type: 'DELETE_DASHBOARD'
      });
    });

    this.appContainer.addEventListener('delete-list', (e) => {
      store.dispatch({
        type: 'DELETE_LIST',
        data: {
          id: e.detail.id
        }
      });
    });

    this.appContainer.addEventListener('delete-task', (e) => {
      store.dispatch({
        type: 'DELETE_TASK',
        data: {
          ...e.detail
        }
      });
    });

    this.appContainer.addEventListener('drag-drop', (e) => {
      store.dispatch({
        type: 'DRAG_DROP_CHANGE',
        data: {
          ...e.detail
        }
      });
    });

    Promise.all([customElements.whenDefined('tira-menu'), customElements.whenDefined('tira-dashboard')]).then(() => {
      const Menu = customElements.get('tira-menu');
      this.menu = new Menu();

      const Dashboard = customElements.get('tira-dashboard');
      this.dashboard = new Dashboard();

      this.appContainer.insertBefore(this.menu, this.appContainer.querySelector('.content-container'));
      this.appContainer.querySelector('.content-container').appendChild(this.dashboard);

      this.render(null, this.state);
    });
  }

  render = (action, state) => {
    this.menu.state = state;
    this.dashboard.state = state.dashboards[state.selected] || null;
  }

}

(() => {
  const getStartedButton = document.querySelector('.home>button');

  getStartedButton.addEventListener('click', e => {
    document.querySelector('.home').setAttribute('hidden', 'true');
    document.querySelector('.app-container').removeAttribute('hidden');

    new App();
  })
})();