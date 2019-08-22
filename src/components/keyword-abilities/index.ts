import { PolymerElement, html } from '@polymer/polymer/polymer-element';
import { customElement } from '@polymer/decorators';

import { default as template } from './template.html';

import './index.scss?name=keyword-abilities';

@customElement('keyword-abilities')
export class KeywordAbilities extends PolymerElement {
  static get template() {
    // @ts-ignore
    return html([template]);
  }
}
