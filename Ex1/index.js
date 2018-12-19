const http = require('http');
const url = require('url');

const portNumber = 3000;
const server = http.createServer((req, res) => {
  const parsedUrlStructure = url.parse(req.url, true);
  const path = parsedUrlStructure.pathname;

  const trimmedPath = path.replace(/^\/+|\/+$/g, '');
  const httpMethod = req.method.toLowerCase();
  const queryStruct = parsedUrlStructure.query;
  const headers = req.headers;

  res.end('Hello, world!\n');
  console.log(`Request received on path: ${trimmedPath} with method: ${httpMethod}\n`);
  console.log(queryStruct);
  console.log(headers);
});

server.listen(portNumber, () => {
  console.log(`Server has been started on port ${portNumber}`);
});