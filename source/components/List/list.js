import {
  createDOMElement
} from '../../utils/index.js';

(async () => {
  const res = await fetch('components/List/list-template.html');
  const textTemplate = await res.text();

  // Parse and select the template tag here instead 
  // of adding it using innerHTML to avoid repeated parsing
  // and searching whenever a new instance of the component is added.
  const HTMLTemplate = new DOMParser().parseFromString(textTemplate, 'text/html').querySelector('template');

  class List extends HTMLElement {
    constructor() {
      super();

      this._state = null;


      const shadowRoot = this.attachShadow({
        mode: 'open'
      });
      const instance = HTMLTemplate.content.cloneNode(true);
      shadowRoot.appendChild(instance);

      const contentBody = this.shadowRoot.querySelector('.list__list-body');

      contentBody.addEventListener('replace-card', e => {
        // const {
        //   targetId,
        //   listId
        // } = e.detail;
        // if (listId === this.listId) {
        //   if (e.detail.enter) {
        //     const list = this.state.listIds;
        //     const indexOfTarget = ''
        //   } else if (e.detail.leave) {

        //   }
        // }
      })

      contentBody.addEventListener('dragover', e => {
        e.preventDefault();
        if (e.currentTarget === e.target || e.currentTarget.contains(e.target)) {
          // contentBody.style.border = '1px dashed #000';
          e.dataTransfer.dropEffect = "move";

          this.afterElement = this.getDragAfterElement(contentBody, e.clientY);
          // console.log(e.dataTransfer.getData("text/plain"));
        }
      }, false);

      // contentBody.addEventListener('dragenter', e => {
      //   if (e.currentTarget === e.target || e.currentTarget.contains(e.target)) {
      //     e.preventDefault();
      //     e.dataTransfer.dropEffect = "move"
      //     contentBody.style.border = '1px dashed #000';
      //     if (e.dataTransfer.types.includes('text/plain')) {
      //       console.log('Drag Enter list', e.dataTransfer.getData("text/plain"));
      //       // if (e.target.className === 'list__list-body') {
      //       // }
      //     }
      //   }
      // }, false);

      // contentBody.addEventListener('dragleave', e => {
      //   e.preventDefault();
      //   contentBody.style.border = 'none';
      //   console.log('Drag Leave');
      // }, false);

      contentBody.addEventListener('drop', e => {
        const data = e.dataTransfer.getData("text/plain");

        const [listId, cardId] = data.split('-');
        console.log('Drop: ', listId, cardId, e.target);

        const targetCardId = this.afterElement ? this.afterElement.getAttribute('card-id') : undefined;
        const targetListId = this.afterElement ? this.afterElement.getAttribute('list-id') : undefined;

        // if (listId === this.listId) {
        //   const elem = contentBody.querySelector('tira-card[card-id="' + cardId + '"]')
        //   if (this.afterElement == null) {
        //     contentBody.appendChild(elem)
        //   } else {
        //     contentBody.insertBefore(elem, this.afterElement)
        //   }
        // } else {
        //   // Different list scenario
        //   const elem = document.querySelector('tira-card[card-id="' + cardId + '"][list-id="' + listId + '"]')
        //   if (this.afterElement == null) {
        //     contentBody.appendChild(elem)
        //   } else {
        //     contentBody.insertBefore(elem, this.afterElement)
        //   }

        // }

        this.dispatchEvent(new CustomEvent('drag-drop', {
          bubbles: true,
          cancelable: false,
          composed: true,
          detail: {
            targetCardId: targetCardId ? Number(targetCardId) : null,
            targetListId: Number(this.listId),
            listId: Number(listId),
            cardId: Number(cardId),
            sameList: listId === this.listId,
          }
        }))
      });

      this.addEventListener('field-update', e => {
        if (e.detail.type === 'list' && e.detail.value) {
          this.dispatchEvent(new CustomEvent('save-list-details', {
            bubbles: true,
            cancelable: false,
            composed: true,
            detail: {
              name: e.detail.value,
              id: Number(this.listId)
            }
          }))
        } else if (e.detail.delete && e.detail.type === 'list') {
          // delete action
          this.dispatchEvent(new CustomEvent('delete-list', {
            bubbles: true,
            cancelable: false,
            composed: true,
            detail: {
              id: Number(this.listId)
            }
          }));
        }
      })
    }

    getDragAfterElement(container, y) {
      const draggableElements = [...container.querySelectorAll('tira-card')]

      return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect()
        const offset = y - box.top - box.height / 2
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child }
        } else {
          return closest
        }
      }, { offset: Number.NEGATIVE_INFINITY }).element
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
      this.listId = this.getAttribute('list-id');
      this.render();
    }

    render() {
      this.shadowRoot.querySelector('.list__list-wrapper').setAttribute('list-id', this.listId);
      this.shadowRoot.querySelector('tira-button').setAttribute('id', this.listId);

      this.shadowRoot.querySelector('.list__list-header').innerHTML = `<tira-field type="list" value="${this.state.name}"></tira-field>`;


      const taskWrapper = this.shadowRoot.querySelector('.list__list-body');

      taskWrapper.innerHTML = null;

      const taskFragment = document.createDocumentFragment();

      const taskIds = this.state.taskIds;

      if (taskIds && taskIds.length) {
        taskIds.forEach(id => {
          const taskData = this.state.tasks[id];
          const taskItem = document.createElement('tira-card');
          taskItem.setAttribute('card-id', taskData.id);
          taskItem.setAttribute('list-id', this.listId);
          taskItem.setAttribute('draggable', 'true');
          taskItem.state = taskData;

          taskFragment.appendChild(taskItem);
        })
      } else {

        const noTaskMessage = createDOMElement('div', {
          class: 'list__no-task-message',
          role: 'button'
        }, 'Click below to create a new task');

        taskFragment.appendChild(noTaskMessage);
      }

      taskWrapper.appendChild(taskFragment);
    }
  }

  customElements.define('tira-list', List);
})();