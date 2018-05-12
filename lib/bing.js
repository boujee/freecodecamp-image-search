'use strict';

import fetch from 'node-fetch';

const URL = 'https://api.cognitive.microsoft.com/bing/v7.0/images/search';

const mapErrors = errs =>
  '[' + errs.map(err => `{code: ${err.code}, message: ${err.message}}`).join(',') + ']';

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

const bingFetch = apiKey => (uri = '') =>
  fetch(URL + uri,  {headers: {'Ocp-Apim-Subscription-Key': apiKey}});

const repeat = apiKey => (uri, count) => 
  wait(1.3 * 1000).then(() => bingFetch(apiKey)(uri).then(checkRate(apiKey)(uri, count + 1)));

const checkRate = apiKey => (uri, count = 0) =>
  res => res.status === 429 
         ? (count >= 3 ? Promise.reject('exceeded retry') : repeat(apiKey)(uri, count)) 
         : res;

const mkFetch = apiKey => (uri = '') =>
  bingFetch(apiKey)(uri)
    .then(checkRate(apiKey)(uri))
    .then(res => res.json())
    .then(checkError)
    .then(checkImages);

export default class BingImage {
  constructor(apiKey) {
    this.fetch = mkFetch(apiKey);
  }
  search({term, count = 10, offset = 0}) {
    const q = encodeURIComponent(term);
    return this.fetch(`?q=${q}&offset=${offset}&count=${count}`);
  }
}