'use strict';

import http from 'http';
import {api, DB, MongoDB, Bing} from '..';

export default async function boot({API_KEY, MONGO_URL, MONGO_DB, PORT = 8080}) {
  if (!API_KEY) throw new Error('API_KEY environment variable must be set');
  if (!MONGO_URL || !MONGO_DB) console.log('MONGO_URL not defined, using internal array as db');
  const mkDB = MONGO_URL && MONGO_DB ? MongoDB(MONGO_URL, MONGO_DB) : DB;
  const bing = new Bing(API_KEY);
  const db = await mkDB();
  const app = api({db, bing});
  const server = http.createServer(app);
  server.on('close', () => {
    console.log('server: shutting down');
    db.close();
  });
  server.listen(PORT, () => {
    console.log(`server: listening on ${PORT}`);
  });
  process.on('SIGINT', () => {
    server.close();
  });
  return server;
}