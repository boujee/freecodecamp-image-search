'use strict';

import express from 'express';

const catch_ = fn => (req, res) => fn(req, res).catch(err => {
  console.error(err);
  return res.status(500).json({error: 'Internal Server Error'});
});

const tap = f => a => f(a).then(() => a);

const mapImage = img =>
  ({url: img.contentUrl, snippet: img.name, thumbnail: img.thumbnailUrl, context: img.hostPageUrl});

export default ({db, bing}) => {

  const search = catch_((req, res) =>
    bing.search({term: req.params.query, offset: req.query.offset || 0})
      .then(images => images.map(mapImage))
      .then(tap(() => db.save(req.params.query)))
      .then(images => res.status(200).json(images))
  );
  
  const latest = catch_((req, res) =>
    db.latest().then(data => res.status(200).json(data))
  );

  return express()
          .get('/api/imagesearch/:query', search)
          .get('/api/latest/imagesearch', latest);
};