import { PolymerElement, html } from '@polymer/polymer/polymer-element';
import { customElement, property, query } from '@polymer/decorators';
import '@polymer/iron-ajax/iron-ajax';
import '@polymer/paper-radio-group/paper-radio-group';
import '@polymer/paper-radio-button/paper-radio-button';
import '@polymer/paper-checkbox/paper-checkbox';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';

import '../keyword-stats';

import { default as template } from './template.html';
import { CardData } from '../../server/keywords';

import './index.scss?name=keyword-abilities';

export type CardElement = CardData[] & { keyword: string };

export enum ColorType {
  COLOR = 'color',
  IDENTITY = 'identity'
}

@customElement('keyword-abilities')
export class KeywordAbilities extends PolymerElement {
  @property() protected keywordData_: CardElement[] = [];
  @property() protected colorType_ = ColorType.IDENTITY;
  @query('#header') protected headerDiv_!: HTMLDivElement;
  @query('#content') protected contentDiv_!: HTMLDivElement;

  static get template() {
    // @ts-ignore
    return html([template]);
  }

  ready() {
    super.ready();
    this.contentDiv_.style.height = `${window.innerHeight - this.headerDiv_.clientHeight - 40}px`;
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
}
