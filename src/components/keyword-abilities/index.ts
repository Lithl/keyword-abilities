import { PolymerElement, html } from '@polymer/polymer/polymer-element';
import { customElement, property } from '@polymer/decorators';
import '@polymer/iron-ajax/iron-ajax';

import { default as template } from './template.html';
import { CardData } from '../../server/keywords';

import './index.scss?name=keyword-abilities';

interface CardElement extends CardData {
  keyword: string;
}

@customElement('keyword-abilities')
export class KeywordAbilities extends PolymerElement {
  @property() protected keywordData_: CardElement[] = [];

  static get template() {
    // @ts-ignore
    return html([template]);
  }

  protected getKeywords_(e: CustomEvent) {
    this.keywordData_ = Object.keys(e.detail.response).map((key: string) => {
      const val = e.detail.response[key];
      val.keyword = key;
      return val;
    });
  }

  protected sortKeywords_(firstEl: CardElement, secondEl: CardElement) {
    return firstEl.keyword > secondEl.keyword ? 1 : -1;
  }

  protected firstUpper_(word: string) {
    return `${word.substring(0, 1).toUpperCase()}${word.substring(1)}`;
  }
}
