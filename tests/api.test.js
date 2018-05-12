'use strict';

import request from 'supertest';
import {boot} from 'freecodecamp-image-search';

let app = null;

beforeAll(async () => {
  app = await boot(process.env);
});

afterAll(() => {
  app.close();
});

const tap = f => a => { f(a); return a; };

const getBody = uri => request(app).get(uri).expect(200).then(({body}) => body);

const getJson = uri => getBody(uri).then(tap(body => expect(body).not.toBeInstanceOf(String)));

const toHaveProperties = (...props) => e => props.forEach(p => e.toHaveProperty(p));

test('I can get the image URLs, alt text and page urls for a set of images relating to a given search string.', async () => {
  const json = await getJson('/api/imagesearch/lol cats');
  expect(json).toBeInstanceOf(Array);
  expect(json.length).toBeGreaterThan(0);
  json.map(_ => expect(_)).forEach(toHaveProperties('url', 'snippet', 'thumbnail', 'context'));
});

test('I can paginate through the responses by adding a ?offset=2 parameter to the URL', async () => {
  const a = await getJson('/api/imagesearch/lol cats');
  const b = await getJson('/api/imagesearch/lol cats?offset=2');
  const c = a.slice(2).concat(b.slice(-2));
  expect(c).toEqual(b);
});

test('I can get a list of the most recently submitted search strings', async () => {
  await getJson('/api/imagesearch/lol cats b');
  await getJson('/api/imagesearch/lol cats a');
  const json = await getJson('/api/latest/imagesearch');
  expect(json).toBeInstanceOf(Array);
  expect(json.length).toBeGreaterThanOrEqual(2);
  json.map(_ => expect(_)).forEach(toHaveProperties('term', 'when'));
  expect(json.map(r => r.term).slice(0, 2)).toEqual(['lol cats a', 'lol cats b']);
});
