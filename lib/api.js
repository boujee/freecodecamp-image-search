'use strict';

import express from 'express';
import fs from 'fs';
import markdownIt from 'markdown-it';

const catch_ = fn => (req, res) => fn(req, res).catch(err => {
  console.error(err);
  return res.status(500).json({error: 'Internal Server Error'});
});

const tap = f => a => f(a).then(() => a);

const mapImage = img =>
  ({url: img.contentUrl, snippet: img.name, thumbnail: img.thumbnailUrl, context: img.hostPageUrl});

const fileContents = filename => new Promise((resolve, reject) =>
  fs.readFile(filename, 'utf8', (err, data) => {
    if (err) reject(err);
    else resolve(data);
  }));

const index = md => catch_((req, res) =>
  md.then((data) => res.status(200).send(markdownIt().render(data)))
);

const search = ({bing, db}) => catch_((req, res) =>
  bing.search({term: req.params.query, offset: req.query.offset || 0})
    .then(images => images.map(mapImage))
    .then(tap(() => db.save(req.params.query)))
    .then(images => res.status(200).json(images))
);

const latest = db => catch_((req, res) =>
  db.latest().then(data => res.status(200).json(data))
);

const api = ({db, bing}) =>
  express()
    .get('/', index(fileContents('README.md')))
    .get('/api/imagesearch/:query', search({bing, db}))
    .get('/api/latest/imagesearch', latest(db));

export default api;