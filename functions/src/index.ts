import * as functions from 'firebase-functions';
import * as express from 'express';
import * as admin from 'firebase-admin';

const cors = require('cors');

admin.initializeApp();
const storage = admin.storage();
const bucket = storage.bucket('timble-demo-website.appspot.com');
const sharp = require('sharp');

const app = express();

app.use(cors({ origin: true }));

app.get('/helloworld', async (req: any, res: any) => {
  res.send('Hello from Firebase POST change!')
});

exports.app = functions.https.onRequest(app);
exports.resize = functions.https.onRequest(async (req: any, res: any) => {
  const query = req.query;
  if (query.name) {
    const file = bucket.file(query.name);
    const data = await file.download();
    const contents = data[0];
    let resizeBuffer = contents;
    if (query.w && query.h) {
      const width = +query.w || 20;
      const height = +query.h || 20;
      resizeBuffer = await sharp(contents)
        .resize(width, height, {
          fit: sharp.fit.inside,
          withoutEnlargement: true
        })
        .toBuffer()
    }
    const resizeImage = Buffer.from(resizeBuffer);
    res.setHeader('content-type', 'image/png');
    res.send(resizeImage);
  } else {
    res.status(404).send('No Image Found');
  }
});
