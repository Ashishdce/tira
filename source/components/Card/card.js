(async () => {
  const res = await fetch('components/Card/card-template.html');
  const textTemplate = await res.text();

  // Parse and select the template tag here instead 
  // of adding it using innerHTML to avoid repeated parsing
  // and searching whenever a new instance of the component is added.
  const HTMLTemplate = new DOMParser().parseFromString(textTemplate, 'text/html').querySelector('template');

  class Card extends HTMLElement {
    constructor() {
      super();

      this._state = {
        edit: false,
        description: '',
        lastUpdated: undefined
      }

      const shadowRoot = this.attachShadow({
        mode: 'open'
      });
      const instance = HTMLTemplate.content.cloneNode(true);
      shadowRoot.appendChild(instance);

      this.addEventListener('dragstart', this.dragStartHandler, false)
      this.addEventListener('dragend', this.dragEndHandler, false)

      // this.addEventListener('dragenter', this.dragEnterhandler, false);
      // this.addEventListener('dragleave', this.dragLeavehandler, false);


      this.editButton = this.shadowRoot.querySelector('.card__edit-button')
      this.saveButton = this.shadowRoot.querySelector('.card__save-button')
      this.cancelButton = this.shadowRoot.querySelector('.card__cancel-button')
      this.attachmentButton = this.shadowRoot.querySelector('.card__attachment-button')
      this.deleteButton = this.shadowRoot.querySelector('.card__delete-button')

      this.editButton.addEventListener('click', this.buttonClickHandler('edit'));
      this.saveButton.addEventListener('click', this.buttonClickHandler('save'));
      this.cancelButton.addEventListener('click', this.buttonClickHandler('cancel'));
      this.attachmentButton.addEventListener('click', this.buttonClickHandler('attachment'));
      this.deleteButton.addEventListener('click', this.buttonClickHandler('delete'));
    }

    // dragEnterhandler(e) {
    //   e.preventDefault()
    //   console.log(e.dataTransfer.getData('text/plain'));
    //   this.dispatchEvent(new CustomEvent('replace-card', {
    //     bubbles: true,
    //     cancelable: false,
    //     composed: true,
    //     detail: {
    //       enter: true,
    //       targetId: Number(this.cardId),
    //       listId: Number(this.listId)
    //     }
    //   }));
    // }
    // dragLeavehandler(e) {
    //   e.preventDefault()
    //   // put the element back
    //   this.dispatchEvent(new CustomEvent('replace-card', {
    //     bubbles: true,
    //     cancelable: false,
    //     composed: true,
    //     detail: {
    //       leave: true,
    //       targetId: Number(this.cardId),
    //       listId: Number(this.listId)
    //     }
    //   }));
    // }

    dragStartHandler(e) {

      // this.removeEventListener('dragenter', this.dragEnterhandler);
      // this.removeEventListener('dragleave', this.dragLeavehandler);
      const ref = e.target;
      ref.style.cursor = 'move';
      e.currentTarget.style.opacity = '0.2';

      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', `${this.listId}-${this.cardId}`);

    }

    dragEndHandler(e) {
      // this.addEventListener('dragenter', this.dragEnterhandler, false);
      // this.addEventListener('dragleave', this.dragLeavehandler, false);
      const ref = e.target;
      ref.style.cursor = 'default';
      e.currentTarget.style.opacity = '1';

      if (e.dataTransfer.dropEffect === 'move') {
        console.log('Drag End: ', `${this.listId}-${this.cardId}`)
      }
    }

    buttonClickHandler = type => (e) => {
      if (type === 'edit') {
        this.editButton.setAttribute('hidden', 'true');
        this.saveButton.removeAttribute('hidden');
        this.cancelButton.removeAttribute('hidden');


        this.state = {
          ...this.state,
          edit: true
        }

        this.render((elem) => {
          if (type === 'edit' && elem) {
            elem.focus();
          }
        })

      } else if (type === 'save') {
        this.editButton.removeAttribute('hidden');
        this.saveButton.setAttribute('hidden', 'true');
        this.cancelButton.setAttribute('hidden', 'true');

        const newValue = this.shadowRoot.querySelector('.card__text-area').value;

        this.state = {
          ...this.state,
          edit: false,
          description: newValue
        }

        this.dispatchEvent(new CustomEvent('save-task-details', {
          bubbles: true,
          cancelable: false,
          composed: true,
          detail: {
            description: newValue,
            edit: false,
            id: this.state.id,
            lastUpdated: new Date().getTime(),
            listId: this.listId
          }
        }))

      } else if (type === 'cancel') {
        this.editButton.removeAttribute('hidden');
        this.saveButton.setAttribute('hidden', 'true');
        this.cancelButton.setAttribute('hidden', 'true');
        this.state = {
          ...this.state,
          edit: false,
        }
        this.dispatchEvent(new CustomEvent('save-task-details', {
          bubbles: true,
          cancelable: false,
          composed: true,
          detail: {
            edit: false,
            id: this.state.id,
            listId: this.listId
          }
        }))
      } else if (type === 'delete') {
        this.dispatchEvent(new CustomEvent('delete-task', {
          bubbles: true,
          cancelable: false,
          composed: true,
          detail: {
            id: this.state.id,
            listId: this.listId
          }
        }));
      }
    }

    set state(data) {
      this._state = {
        ...this._state,
        ...data
      }
      this.render();
    }

    get state() {
      return this._state;
    }

    getDate(timestamp) {
      const date = new Date(timestamp);

      return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
    }

    connectedCallback() {
      this.cardId = this.getAttribute('card-id');
      this.listId = this.getAttribute('list-id');
      this.render();
    }

    render(callback) {

      return new Promise((resolve, reject) => {
        this.shadowRoot.querySelector('.card__card-container').setAttribute('id', this.cardId);
        this.shadowRoot.querySelector('.card__content_text').innerHTML = '';

        let textAreaElem;

        if (this.state.edit) {
          textAreaElem = document.createElement('textarea');
          textAreaElem.setAttribute('class', 'card__text-area')
          textAreaElem.setAttribute('placeholder', 'Enter task details here.');
          textAreaElem.value = this.state.description;
          this.shadowRoot.querySelector('.card__content_text').appendChild(textAreaElem);
          textAreaElem.focus();

          this.editButton.setAttribute('hidden', 'true');
          this.saveButton.removeAttribute('hidden');
          this.cancelButton.removeAttribute('hidden');

        } else {
          this.shadowRoot.querySelector('.card__content_text').innerHTML = `<div class="card__text">${this.state.description}</div>`
        }

        if (this.state.lastUpdated) {
          this.shadowRoot.querySelector('.card__content_updated').innerHTML =
            ` <div class="card__last-updated" >Last Updated: ${this.getDate(this.state.lastUpdated)}</div>
          `
        }

        resolve(textAreaElem);
      }).then(callback)

    }
  }

  customElements.define('tira-card', Card);
})();