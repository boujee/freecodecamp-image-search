'use strict';

import {api, db, bing} from '..';

let {port, API_KEY} = process.env;

port = port || 8080;

api({db: new db(), bing: new bing(API_KEY)})
  .listen(port, () => console.log(`listening on ${port}`));