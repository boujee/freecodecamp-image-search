'use strict';

class DB {
  constructor() {
    this.data = [];
  }
  save(term) {
    return new Promise((resolve) => {
      const when = (new Date()).toUTCString();
      this.data.push({term, when});
      resolve();
    });
  }
  latest() {
    return new Promise((resolve) => {
      resolve(this.data.slice(-10).reverse());
    });
  }
  close() {}
}

const db = () => Promise.resolve(new DB());

export default db;