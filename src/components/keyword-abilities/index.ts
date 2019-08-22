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

export enum LegalCategory {
  LEGAL_ANY = 'legal-any',
  LEGAL_ALL = 'legal-all',
  ILLEGAL_ANY = 'illegal-any',
  ILLEGAL_ALL = 'illegal-all',
  RESTRICTED_ANY = 'restricted-any',
  RESTRICTED_ALL = 'restricted-all',
  ALL = 'all'
}

export interface FormatCheckboxGroup {
  standard: true,
  future: boolean;
  modern: boolean;
  legacy: boolean;
  pauper: boolean;
  vintage: boolean;
  penny: boolean;
  commander: boolean;
  brawl: boolean;
  duel: boolean;
  oldschool: boolean;
}

@customElement('keyword-abilities')
export class KeywordAbilities extends PolymerElement {
  @property() protected keywordData_: CardElement[] = [];
  @property() protected colorType_ = ColorType.IDENTITY;
  @property() protected legalCategory_ = LegalCategory.LEGAL_ANY;
  @property() protected formatCheckboxes_: FormatCheckboxGroup = {
    standard: true,
    future: true,
    modern: true,
    legacy: true,
    pauper: true,
    vintage: true,
    penny: true,
    commander: true,
    brawl: true,
    duel: true,
    oldschool: true,
  };
  @query('#header') protected headerDiv_!: HTMLDivElement;
  @query('#content') protected contentDiv_!: HTMLDivElement;

  static get template() {
    // @ts-ignore
    return html([template]);
  }

  ready() {
    super.ready();
    this.contentDiv_.style.height = `${window.innerHeight - this.headerDiv_.clientHeight - 32}px`;
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
