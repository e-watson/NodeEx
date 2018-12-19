const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');

// HTTP server
const httpServer = http.createServer((req, res) => {
  unifiedServer(req, res);
});

httpServer.listen(config.httpPort, () => {
  console.log(`Server has been started on port ${config.httpPort} in ${config.envName} mode`);
});

// HTTPS server
const httpsServerOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem')
};
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
  unifiedServer(req, res);
});

httpsServer.listen(config.httpsPort, () => {
  console.log(`Server has been started on port ${config.httpsPort} in ${config.envName} mode`);
});

// HTTP and HTTPS servers
const unifiedServer = (req, res) => {
  const parsedUrlStructure = url.parse(req.url, true);
  const path = parsedUrlStructure.pathname;

  const trimmedPath = path.replace(/^\/+|\/+$/g, '');
  const httpMethod = req.method.toLowerCase();
  const queryStruct = parsedUrlStructure.query;
  const headers = req.headers;

  const decoder = new StringDecoder('utf-8');
  let buffer = '';

  req.on('data', bufferData => {
    buffer += decoder.write(bufferData);
  });

  req.on('end', () => {
    buffer += decoder.end();

    const chosenHandler = typeof(router[trimmedPath]) !== 'undefined'
      ? router[trimmedPath]
      : handlers.notFound;

    const data = {
      'trimmedPath': trimmedPath,
      'queryStruct': queryStruct,
      'method': httpMethod,
      'headers': headers,
      'payload': buffer
    }

    chosenHandler(data, (statusCode, payload) => {
      statusCode = typeof(statusCode) === 'number' ? statusCode : 200;
      payload = typeof(payload) === 'object' ? payload : {};

      const payloadString = JSON.stringify(payload);

      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      console.log(`Request received on path: ${trimmedPath} with method: ${httpMethod}\n`);
      console.log(queryStruct);
      console.log(headers);
      console.log(buffer);

      console.log(`Returning this response: ${statusCode} .. ${payloadString}`);
    });
  });
};

// Router
const handlers = {
  sample: (data, callback) => { callback(406, { 'name': 'sample handler' }); },
  notFound: (data, callback) => { callback(404); }
};

const router = {
  'sample': handlers.sample
};