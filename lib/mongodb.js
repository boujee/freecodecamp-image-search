'use strict';

import Mongo from 'mongodb';

class MongoDB {
  constructor(client, db) {
    this.client = client;
    this.db = db;
  }
  save(term) {
    return new Promise((resolve, reject) => {
      const when = (new Date()).toUTCString();
      this.db.collection('searches').save({term, when}, (err, res) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
  latest() {
    return new Promise((resolve, reject) => {
      this.db.collection('searches')
        .find()
        .sort({$natural: -1})
        .limit(10)
        .toArray((err, res) => {
          if (err) reject(err);
          else resolve(res.map(({term, when}) => ({term, when})));
      })
    });
  }
  close() {
    this.client.close();
  }
}

const mkMongo = (URL, dbName) => () => new Promise((resolve, reject) => {
  Mongo.MongoClient.connect(URL, {useNewUrlParser:true}, (err, client) => {
    if (err) reject(err);
    else resolve(new MongoDB(client, client.db(dbName)));
  });
});

export default mkMongo;