import {
  createDOMElement
} from '../../utils/index.js';

(async () => {
  const res = await fetch('components/EditableField/template.html');
  const textTemplate = await res.text();

  const HTMLTemplate = new DOMParser().parseFromString(textTemplate, 'text/html').querySelector('template');

  class EditableField extends HTMLElement {
    constructor() {
      super();

      const shadowRoot = this.attachShadow({
        mode: 'open'
      });
      const instance = HTMLTemplate.content.cloneNode(true);
      shadowRoot.appendChild(instance);

      this.editButton = this.shadowRoot.querySelector('.editable-field__edit-button')
      this.saveButton = this.shadowRoot.querySelector('.editable-field__save-button')
      this.cancelButton = this.shadowRoot.querySelector('.editable-field__cancel-button')
      this.deleteButton = this.shadowRoot.querySelector('.editable-field__delete-button')
      this.inputField = this.shadowRoot.querySelector('.editable-field__input')
      this.text = this.shadowRoot.querySelector('.editable-field__text')

      this.editButton.addEventListener('click', e => {
        this.editButton.setAttribute('hidden', 'true');
        this.text.setAttribute('hidden', 'true');
        this.saveButton.removeAttribute('hidden');
        this.cancelButton.removeAttribute('hidden');
        this.inputField.removeAttribute('hidden');
        this.inputField.focus();
      })
      this.saveButton.addEventListener('click', e => {
        this.editButton.removeAttribute('hidden');
        this.text.removeAttribute('hidden');
        this.saveButton.setAttribute('hidden', 'true');
        this.cancelButton.setAttribute('hidden', 'true');
        this.inputField.setAttribute('hidden', 'true');

        if (this.inputField.value.trim()) {
          this.setAttribute('value', this.inputField.value);
          this.dispatchEvent(new CustomEvent('field-update', {
            bubbles: true,
            cancelable: false,
            composed: true,
            detail: {
              value: this.inputField.value,
              type: this.type
            }
          }))
        } else {
          this.inputField.value = this.textValue;
        }
      })
      this.cancelButton.addEventListener('click', e => {
        this.editButton.removeAttribute('hidden');
        this.text.removeAttribute('hidden');
        this.saveButton.setAttribute('hidden', 'true');
        this.cancelButton.setAttribute('hidden', 'true');
        this.inputField.setAttribute('hidden', 'true');
        this.inputField.value = this.textValue;
      })

      this.deleteButton.addEventListener('click', e => {
        this.dispatchEvent(new CustomEvent('field-update', {
          bubbles: true,
          cancelable: false,
          composed: true,
          detail: {
            type: this.type,
            delete: true
          }
        }))
      })

    }

    set state(data) {
      this._state = {
        ...this._state,
        ...data
      };
    }

    get state() {
      return this._state;
    }

    connectedCallback() {
      this.textValue = this.getAttribute('value');
      this.type = this.getAttribute('type');
      this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
      // When the drawer is disabled, update keyboard/screen reader behavior.
      if (name === 'value' && oldValue !== newValue) {
        this.render();
      }
      // TODO: also react to the open attribute changing.
    }

    render() {
      if (this.type === 'list') {
        this.shadowRoot.querySelector('.editable-field__container').classList.add('type__list');
        this.text.classList.add('truncate');
      }
      this.inputField.value = this.textValue;
      this.text.innerHTML = this.textValue;
    }
  }

  customElements.define('tira-field', EditableField);
})();