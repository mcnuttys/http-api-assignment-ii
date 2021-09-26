const http = require('http');
const url = require('url');
const query = require('querystring');

const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  GET: {
    '/': htmlHandler.getIndex,
    '/style.css': htmlHandler.getCSS,
    '/getUsers': jsonHandler.getUsers,
    notFound: jsonHandler.notFound,
  },
  HEAD: {
    '/getUsers': jsonHandler.getUsersMeta,
    notFound: jsonHandler.notFoundMeta,
  },
  POST: {
    '/addUser': jsonHandler.addUser,
    notFound: jsonHandler.notFound,
  },
};

const handlePost = (request, response, parsedUrl) => {
  const res = response;

  const body = [];

  request.on('error', (err) => {
    console.dir(err);
    res.statusCode = 400;
    res.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = query.parse(bodyString);

    urlStruct[request.method][parsedUrl.pathname](request, res, bodyParams);
  });
};

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);
  if (urlStruct[request.method] && urlStruct[request.method][parsedUrl.pathname]) {
    if (request.method === 'POST') {
      handlePost(request, response, parsedUrl);
    } else {
      urlStruct[request.method][parsedUrl.pathname](request, response);
    }
  } else {
    urlStruct[request.method].notFound(request, response);
  }
};

http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
