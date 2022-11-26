const { createServer } = require("https");
const { parse } = require("url");
const next = require("next");
const { readFileSync } = require("fs");


/* simple command to get https key/certificate :
 * openssl req -x509 -out .next-https/certs/localhost.crt -keyout .next-https/certs/localhost.key \
  -days 365 \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=localhost' -extensions EXT -config <( \
   printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
*/
const httpsOptions = {
  key: readFileSync('.next-https/certs/localhost.key'),
  cert: readFileSync('.next-https/certs/localhost.crt'),
};

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

/* simple script to launch an https server used to access
 * the project on the local network through other devices
 * bc web audio api needs https or 127.0.0.1 to run */
(async () => {
  await app.prepare();
  const server = createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });
  let serverPort = 3000;
  server.on('error', (e) => {
    console.error(`❌ \x1b[31mAn error ${e.code} has been catched.\x1b[0m`)
    server.close();
    if (e.code === 'EADDRINUSE') {
      console.warn(
        `⛔ \x1b[3m\x1b[91mThe given port was already in use, retrying on port \x1b[1m${e.port + 1}\x1b[0m\x1b[3m\x1b[91m ...\x1b[0m`
      );
      serverPort += 1;
      return server.listen(serverPort);
    }
  });
  server.listen(3000, () => {
    console.log(`✨✨\x1b[33m Server started on \x1b[93m\x1b[4mhttps://localhost:${serverPort}\x1b[0m ✨✨`);
  });
})();
