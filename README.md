# freecodecamp-image-search
JSON API powered by Bing Image Search.

Uses MongoDB for persistance with fallback to JS Array.

### environment variables
```shell
API_KEY=<YOUR BING API KEY>
# (optional)
MONGO_URL=<URL TO MONGODB>
# (optional) 
MONGO_DB=<MONGO DB USERNAME>
```

### endpoints
```
/api/imagesearch/:query?offset=:offset
/api/latest/imagesearch
```

### testing
```shell
API_KEY=<YOUR BING KEY> npm test
```

### testing with MongoDB
```shell
API_KEY<YOUR BING KEY> MONGO_URL=<MONGO URL> MONGO_DB=<MONGO DB> npm test
```