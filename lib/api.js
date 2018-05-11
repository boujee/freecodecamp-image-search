'use strict';

import express from 'express';
import fetch from 'node-fetch';

const URL = 'https://api.cognitive.microsoft.com/bing/v7.0/images/search';

const mapImage = img =>
  ({url: img.contentUrl, snippet: img.name, thumbnail: img.thumbnailUrl, context: img.hostPageUrl});

const mapErrors = errs =>
  '[' + errs.map(err => `{code: ${err.code}, message: ${err.message}}`).join(',') + ']';

const catch_ = fn => (req, res) => fn(req, res).catch(err => {
  console.error(err);
  return res.status(500).json({error: 'Internal Server Error'});
});

const offset = req => req.query.offset ? Number(req.query.offset) : 0;

const wait = n => new Promise((resolve, reject) => setTimeout(resolve));

const checkError = res => 
  res._type === 'ErrorResponse' ? Promise.reject(mapErrors(res.errors)) : res;

function checkArray(res) {
  if (!res.hasOwnProperty('value')) return Promise.reject(['no value in response', res]);
  if (!Array.isArray(res.value)) return Promise.reject(['value is not array', res.value]);
  return Promise.resolve(res.value);
}

const checkImages =
  res => res._type === 'Images' ? checkArray(res) : Promise.reject(['response is not Images', res]);

export default ({API_KEY}) => {
  const basicFetch = (uri = '') =>
    fetch(URL + uri,  {headers: {'Ocp-Apim-Subscription-Key': API_KEY}});
  
  function checkRate(uri, count = 0) {
    return res => {
      if (res.status === 429) {
        if (count >= 3) return Promise.reject('too many retries');
        else return wait(1.1 * 1000).then(() => basicFetch(uri).then(checkRate(uri, count + 1)));
      } else {
        return res;
      }
    };
  }

  const fetchAPI = (uri = '') =>
    basicFetch(uri)
      .then(checkRate(uri))
      .then(res => res.json())
      .then(checkError)
      .then(checkImages);

  const search = catch_((req, res) =>
    fetchAPI(`?q=${encodeURIComponent(req.params.query)}&offset=${offset(req)}&count=10`)
      .then(images => images.map(mapImage))
      .then(images => res.json(images)));

  return express().get('/api/imagesearch/:query', search);
};