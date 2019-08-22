import express from 'express';
import * as bodyParser from 'body-parser';
import * as keywords from './keywords';

export function apply(root: string) {
  const app = express();

  const whitelist: {[uri: string]: string} = {
    'mtgKeywords.js': 'dist/mtgKeywords.js',
    'mtgKeywords.lib.js': 'dist/vendors~mtgKeywords.js',
    'web-animations.js':
        'node_modules/web-animations-js/web-animations-next-lite.min.js',
    'root.css': '',
    '': 'index.html',
    'favicon.ico': '',
  };

  app.use('/images', express.static('resources/images'));
  for (const key in whitelist) {
    const file = whitelist[key] || key;
    app.get(`/${key}`, (_: express.Request, res: express.Response) =>
        res.sendFile(`${root}/${file}`));
  }

  app.use(bodyParser.json());
  keywords.apply(app);


  app.listen(3003, () => console.log('Server running on port 3003'));
}
