'use strict';

import request from 'supertest';
import {api, db, bing} from 'freecodecamp-image-search';

if (!process.env.hasOwnProperty('API_KEY')) {
  throw new Error('API_KEY environment variable must be set');
}

const {API_KEY} = process.env;
const mkAPI = () => api({db: new db(), bing: new bing(API_KEY)});
const tap = f => a => { f(a); return a; };
const getBody = (uri, app = mkAPI()) => request(app).get(uri).expect(200).then(({body}) => body);
const getJson = (uri, app = mkAPI()) => getBody(uri, app).then(tap(body => expect(body).not.toBeInstanceOf(String)));
const toHaveProperties = (...arr) => e => arr.forEach(p => expect(e).toHaveProperty(p));

describe('api', () => {
  test('I can get the image URLs, alt text and page urls for a set of images relating to a given search string.', () =>
    getJson('/api/imagesearch/lol cats')
      .then(tap(body => expect(body).toBeInstanceOf(Array)))
      .then(tap(body => expect(body).toHaveProperty('0')))
      .then(body => body[0])
      .then(toHaveProperties('url', 'snippet', 'thumbnail', 'context'))
  );
  test('I can paginate through the responses by adding a ?offset=2 parameter to the URL', () =>
    Promise.all([getJson('/api/imagesearch/lol cats'), getJson('/api/imagesearch/lol cats?offset=2')])
      .then(([a, b]) => [a.slice(2).concat(b.slice(-2)), b])
      .then(([a, b]) => expect(a).toEqual(b))
  );
  test('I can get a list of the most recently submitted search strings', () => {
    const app = mkAPI();
    return getJson('/api/imagesearch/lol cats b', app)
      .then(() => getJson('/api/imagesearch/lol cats a', app))
      .then(() => getJson('/api/latest/imagesearch', app))
      .then(tap(body => expect(body).toBeInstanceOf(Array)))
      .then(tap(body => expect(body.length).toBeGreaterThanOrEqual(2)))
      .then(tap(body => body.forEach(toHaveProperties('term', 'when'))))
      .then(body => body.map(r => r.term))
      .then(body => body.slice(0, 2))
      .then(tap(body => expect(body).toEqual(['lol cats a', 'lol cats b'])))
  });
});
