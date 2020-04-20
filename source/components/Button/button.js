import {
  createDOMElement
} from '../../utils/index.js';

(async () => {
  const res = await fetch('components/Button/template.html');
  const textTemplate = await res.text();

  const HTMLTemplate = new DOMParser().parseFromString(textTemplate, 'text/html').querySelector('template');

  class Button extends HTMLElement {
    constructor() {
      super();

      const shadowRoot = this.attachShadow({
        mode: 'open'
      });
      const instance = HTMLTemplate.content.cloneNode(true);
      shadowRoot.appendChild(instance);

      this.shadowRoot.querySelector('.button__button').addEventListener('click', e => {
        this.dispatchEvent(new CustomEvent('add-button-clicked', {
          bubbles: true,
          cancelable: false,
          composed: true,
          detail: {
            type: this.type,
            id: this.id
          }
        }));
      });
    }

    connectedCallback() {
      this.type = this.getAttribute('type');
      this.id = this.getAttribute('id');
    }
  }

  customElements.define('tira-button', Button);
})();