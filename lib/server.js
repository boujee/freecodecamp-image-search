'use strict';

import {api} from '..';

let {port, API_KEY} = process.env;

port = port || 8080;

api({API_KEY}).listen(port, () => console.log(`listening on ${port}`));