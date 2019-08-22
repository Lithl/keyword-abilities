import express from 'express';
import request from 'request-promise-native';

type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G';
export enum Legality {
  NOT_LEGAL = 'not_legal',
  LEGAL = 'legal',
  RESTRICTED = 'restricted'
}

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

export function apply(app: express.Application) {
  const keywords: {[key: string]: CardData[]} = {};

  function timer(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function getCardData(keyword: string, uri?: string) {
    console.info(`called getCardData(${keyword}, ${uri})`);
    const kwdLower = keyword.toLowerCase();
    const queryStr = `o:/\\b${kwdLower}\\b/`;
    return request(uri || `https://api.scryfall.com/cards/search?q=${queryStr}`)
        .then(async (text: string) => {
          const json = JSON.parse(text);
          const data: CardData[] = [];
          json.data.forEach((orig: any) => {
            if (orig.card_faces) {
              const frontText = orig.card_faces[0].oracle_text;
              const backText = orig.card_faces[1].oracle_text;
              if (frontText.toLowerCase().indexOf(kwdLower) >= 0) {
                data.push({
                  name: orig.card_faces[0].name,
                  scryfallUri: orig.scryfall_uri,
                  colors: orig.card_faces[0].colors || orig.colors,
                  colorIdentity: orig.color_identity,
                  legalities: orig.legalities,
                });
              }
              if (backText.toLowerCase().indexOf(kwdLower) >= 0) {
                data.push({
                  name: orig.card_faces[1].name,
                  scryfallUri: orig.scryfall_uri,
                  colors: orig.card_faces[1].colors || orig.colors,
                  colorIdentity: orig.color_identity,
                  legalities: orig.legalities,
                });
              }
            } else {
              data.push({
                name: orig.name,
                scryfallUri: orig.scryfall_uri,
                colors: orig.colors,
                colorIdentity: orig.color_identity,
                legalities: orig.legalities,
              });
            }
          });

          if (!keywords[kwdLower]) {
            keywords[kwdLower] = [];
          }
          keywords[kwdLower] = keywords[kwdLower].concat(data);

          if (json.next_page) {
            await timer(1000);
            await getCardData(keyword, json.next_page);
          }
        });
  }

  function populateKeywords() {
    console.info('called populateKeywords');
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
            await getCardData(arr[1]);
            await timer(1000); // Scryfall requests 50-100ms delay between queries
          }
        });
      } else {
        throw new TypeError(`Could not find a match for ${crUri}`);
      }
    });
  }
  populateKeywords().catch((err: string) => {
    console.error(err);
  });

  app.get('/keywords', (_: express.Request, res: express.Response) => {
    if (!Object.keys(keywords).length) {
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
    populateKeywords().finally(() => {
      res.status(200).send({
        updating: true,
        message: 'A full update has begun. This will take several minutes. '
            + 'Please do not spam Scryfall by spaming this update request.',
      });
    });
  });
}
