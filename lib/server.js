'use strict';

import {boot} from '..';

boot(process.env).catch(e => {
  throw e;
});
