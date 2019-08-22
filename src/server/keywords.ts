import express from 'express';
import request from 'request-promise-native';

type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G';
type Legality = 'not_legal' | 'legal' | 'restricted';

export interface CardData {
  name: string;
  scryfallUri: string;
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
}

const rulesPageUrl =
    'https://magic.wizards.com/en/game-info/gameplay/rules-and-formats/rules';
const uriRegex =
    /https:\/\/media.wizards.com\/\d{4}\/downloads\/MagicCompRules.+\.txt/;
const keywords: {[key: string]: CardData[]} = {};

function timer(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getCardData(keyword: string, uri?: string) {
  const kwdLower = keyword.toLowerCase();
  const queryStr = `o:/\\b${kwdLower}\\b/`;
  return request(uri || `https://api.scryfall.com/cards/search?q=${queryStr}`)
      .then(async (text: string) => {
        const json = JSON.parse(text);
        const data: CardData[] = [];
        json.data.forEach((orig: any) => {
          data.push({
            name: orig.name,
            scryfallUri: orig.scryfall_uri,
            colors: orig.colors,
            colorIdentity: orig.color_identity,
            legalities: orig.legalities,
          });
        });

        if (!keywords[kwdLower]) {
          keywords[kwdLower] = [];
        }
        keywords[kwdLower] = keywords[kwdLower].concat(data);
        console.log(kwdLower, keywords[kwdLower].length);

        if (json.next_page) {
          await timer(100);
          getCardData(keyword, json.next_page);
        }
      });
}

function populateKeywords() {
  return request(rulesPageUrl).then((html: string) => {
    let matches = html.match(uriRegex);
    const crUri = matches && matches[0];

    if (crUri) {
      request(crUri).then(async (text: string) => {
        matches = text.match(/(\d+)\. Keyword Abilities/);
        const section = matches && matches[1];
        const keywordsRegex = new RegExp(`${section}\\.\\d+\\. (.+)`, 'g');
        let arr = keywordsRegex.exec(text); // 702.1 is not itself a keyword
        while ((arr = keywordsRegex.exec(text)) !== null) {
          getCardData(arr[1]);
          await timer(100); // Scryfall requests 50-100ms delay between queries
        }
      });
    }
  });
}
populateKeywords().catch((err: string) => console.error(err));

export function apply(app: express.Application) {
  app.get('/keywords', (_: express.Request, res: express.Response) => {
    if (!keywords.length) {
      populateKeywords().then(() => {
        res.status(200).send(keywords);
      }).catch((error) => {
        res.status(500).send({ error });
      });
    } else {
      res.status(200).send(keywords);
    }
  });

  app.get('/repopulate-keywords',
      (_: express.Request, res: express.Response) => {
    for (const k in keywords) delete keywords[k];
    populateKeywords().then(() => {
      res.status(200).send({ done: true });
    }).catch((error) => {
      res.status(500).send({ error });
    });
  });
}
