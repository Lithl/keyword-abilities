import { PolymerElement, html } from '@polymer/polymer/polymer-element';
import { customElement, property, observe, query } from '@polymer/decorators';
import { DomRepeat } from '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/paper-tooltip/paper-tooltip';

import '../pie-mana-display';

import { default as template } from './template.html';
import { CardElement, ColorType, LegalCategory, FormatCheckboxGroup } from '../keyword-abilities';
import { CardData, Legality } from '../../server/keywords';
import { assertUnreachable } from '../../util';

import './index.scss?name=keyword-stats';

type FormatKey = 'standard' | 'future' | 'modern' | 'legacy' | 'pauper'
    | 'vintage' | 'penny' | 'commander' | 'brawl' | 'duel' | 'oldschool';

@customElement('keyword-stats')
export class KeywordStats extends PolymerElement {
  @property({type: Object, observer: 'keywordDataChanged_'})
  keywordData?: CardElement;
  @property() colorType = ColorType.IDENTITY;
  @property({type: String, observer: 'legalCategoryChanged_'})
  legalCategory = LegalCategory.LEGAL_ANY;
  @property() formatCheckboxes: FormatCheckboxGroup = {
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
  @property() protected numW_ = 0;
  @property() protected numU_ = 0;
  @property() protected numB_ = 0;
  @property() protected numR_ = 0;
  @property() protected numG_ = 0;
  @property() protected numC_ = 0;
  @property() protected numM_ = 0;
  @property() protected numIdW_ = 0;
  @property() protected numIdU_ = 0;
  @property() protected numIdB_ = 0;
  @property() protected numIdR_ = 0;
  @property() protected numIdG_ = 0;
  @property() protected numIdC_ = 0;
  @property() protected numIdM_ = 0;
  @property() private cardListShowing_ = false;
  @property() private filtered_?: CardData[];
  @query('#cardListTemplate') private cardList_!: DomRepeat | null;

  static get template() {
    // @ts-ignore
    return html([template]);
  }

  ready() {
    super.ready();
    this.addEventListener('tap', () => {
      this.cardListShowing_ = !this.cardListShowing_;
      this.cardList_ && this.cardList_.render();
    });
  }

  protected isIdentity_() {
    return this.colorType === ColorType.IDENTITY;
  }

  protected legalCategoryChanged_() {
    if (this.keywordData) {
      this.keywordDataChanged_(this.keywordData);
    }
  }

  @observe('formatCheckboxes.*')
  protected formatCheckboxesChanged_() {
    if (this.keywordData) {
      this.keywordDataChanged_(this.keywordData);
    }
  }

  private isLegal_(legality: Legality) {
    return legality === Legality.LEGAL || legality === Legality.RESTRICTED;
  }

  protected filterCardListFn_(cardData: CardData) {
    return this.filterFn_(cardData) && this.cardListShowing_;
  }

  private filterFnIndempotent_(
      cardData: CardData,
      formatCheckboxes: FormatCheckboxGroup,
      legalCategory: LegalCategory,
      isLegal: (arg0: Legality) => boolean) {
    const formats = Object.keys(cardData.legalities);
    const formatsChecked = formats
        .filter((name) => formatCheckboxes[name as FormatKey]);
    switch (legalCategory) {
      case LegalCategory.LEGAL_ANY:
        return formatsChecked.some((name) =>
            isLegal(cardData.legalities[name as FormatKey]));
      case LegalCategory.LEGAL_ALL:
        return formatsChecked.every((name) =>
            isLegal(cardData.legalities[name as FormatKey]));
      case LegalCategory.ILLEGAL_ANY:
        return formatsChecked.some((name) =>
          !isLegal(cardData.legalities[name as FormatKey]));
      case LegalCategory.ILLEGAL_ALL:
        return formatsChecked.every((name) =>
          !isLegal(cardData.legalities[name as FormatKey]));
      case LegalCategory.RESTRICTED_ANY:
        return formatsChecked.some((name) =>
          cardData.legalities[name as FormatKey] === Legality.RESTRICTED);
      case LegalCategory.RESTRICTED_ALL:
        return formatsChecked.every((name) =>
          cardData.legalities[name as FormatKey] === Legality.RESTRICTED);
      case LegalCategory.ALL:
        return true;
      default:
        return assertUnreachable(legalCategory);
    }
  }

  private filterFn_(cardData: CardData) {
    return this.filterFnIndempotent_(
      cardData,
      this.formatCheckboxes,
      this.legalCategory,
      this.isLegal_);
  }

  protected filteredLength_(keywordData: CardElement, _extra: number) {
    // return keywordData.filter((el) => this.filterFn_(el)).length + (extra || 0);
    return keywordData.length;
  }

  private keywordDataChanged_(keywordData: CardElement) {
    /*
  legalities: {
    standard: Legality,
    future: Legality,
    modern: Legality,
    legacy: Legality,
    pauper: Legality,
    vintage: Legality,
    penny: Legality,
    commander: Legality,
    brawl: Legality,
    duel: Legality,
    oldschool: Legality,
  };
  */
    this.numW_ = 0;
    this.numU_ = 0;
    this.numB_ = 0;
    this.numR_ = 0;
    this.numG_ = 0;
    this.numC_ = 0;
    this.numM_ = 0;
    this.numIdW_ = 0;
    this.numIdU_ = 0;
    this.numIdB_ = 0;
    this.numIdR_ = 0;
    this.numIdG_ = 0;
    this.numIdC_ = 0;
    this.numIdM_ = 0;
    this.filtered_ = keywordData.filter((el) => this.filterFn_(el));
    this.cardList_ && this.cardList_.render();
    for (const card of this.filtered_) {
      if (card.colors.includes('W')) this.numW_++;
      if (card.colors.includes('U')) this.numU_++;
      if (card.colors.includes('B')) this.numB_++;
      if (card.colors.includes('R')) this.numR_++;
      if (card.colors.includes('G')) this.numG_++;
      if (!card.colors.length) this.numC_++;
      if (card.colors.length > 1) this.numM_++;
      if (card.colorIdentity.includes('W')) this.numIdW_++;
      if (card.colorIdentity.includes('U')) this.numIdU_++;
      if (card.colorIdentity.includes('B')) this.numIdB_++;
      if (card.colorIdentity.includes('R')) this.numIdR_++;
      if (card.colorIdentity.includes('G')) this.numIdG_++;
      if (!card.colorIdentity.length) this.numIdC_++;
      if (card.colorIdentity.length > 1) this.numIdM_++;
    }
  }

  protected firstUpper_(word: string) {
    return `${word.substring(0, 1).toUpperCase()}${word.substring(1)}`;
  }

  protected pct_(num: number) {
    const filtered = this.keywordData ? this.filtered_ : [];
    if (!filtered) return '0.00%';
    return `${(num / filtered.length * 100).toFixed(2)}%`;
  }
}
