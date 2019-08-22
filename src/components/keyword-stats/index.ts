import { PolymerElement, html } from '@polymer/polymer/polymer-element';
import { customElement, property } from '@polymer/decorators';
import '@polymer/paper-tooltip/paper-tooltip';

import '../pie-mana-display';

import { default as template } from './template.html';
import { CardElement, ColorType } from '../keyword-abilities';

import './index.scss?name=keyword-stats';

@customElement('keyword-stats')
export class KeywordStats extends PolymerElement {
  @property({type: Object, observer: 'keywordDataChanged_'})
  keywordData?: CardElement;
  @property() colorType = ColorType.IDENTITY;
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

  static get template() {
    // @ts-ignore
    return html([template]);
  }

  ready() {
    super.ready();
    this.addEventListener('tap', () =>
        this.cardListShowing_ = !this.cardListShowing_);
  }

  protected isIdentity_() {
    return this.colorType === ColorType.IDENTITY;
  }

  protected keywordDataChanged_(keywordData: CardElement) {
    /*
  colors: ManaColor[];
  colorIdentity: ManaColor[];
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
    for (const card of keywordData) {
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
    return `${(num / this.keywordData!.length * 100).toFixed(2)}%`;
  }
}
