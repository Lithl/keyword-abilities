import { PolymerElement, html } from '@polymer/polymer/polymer-element';
import { customElement, property } from '@polymer/decorators';

import { default as template } from './template.html';

import './index.scss?name=pie-mana-display';

@customElement('pie-mana-display')
export class PieManaDisplay extends PolymerElement {
  @property() numW = 0;
  @property() numU = 0;
  @property() numB = 0;
  @property() numR = 0;
  @property() numG = 0;
  @property() numC = 0;
  @property() total = 0;

  static get template() {
    // @ts-ignore
    return html([template]);
  }

  protected computePieStyle_() {
    const fallback = `background: conic-gradient(
      white 0%, white 11%,
      red 11%, red 13.5%,
      white 13.5%, white 36%,
      red 36%, red 38%,
      white 38%, white 61%,
      red 61%, red 63%,
      white 63%, white 86%,
      red 86%, red 88%,
      white 88%)`;
    if (this.total === 0) return fallback;

    const white = this.numW / this.total * 100;
    const blue = white + this.numU / this.total * 100;
    const black = blue + this.numB / this.total * 100;
    const red = black + this.numR / this.total * 100;
    const green = red + this.numG / this.total * 100;
    if (green === 0 && this.numC === 0) return fallback;
    return `background: conic-gradient(
      white 0%, white ${white}%,
      blue ${white}%, blue ${blue}%,
      black ${blue}%, black ${black}%,
      red ${black}%, red ${red}%,
      green ${red}%, green ${green}%,
      brown ${green}%, brown 100%)`;
  }
}
