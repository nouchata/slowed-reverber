#!/bin/bash

# live webpack messes with ffmpeg so we need to ensure the availability
# of the files it's using but putting them in the public dir
if ! $(ls ./public/assets/js/ffmpeg-core.js 1>/dev/null 2>&1); then
  cp ./node_modules/@ffmpeg/core/dist/* ./public/assets/js/;
fi;

# the local server runs w/ https (not mandatory since localhost bypasses
# https restrictions) to do mobile test on a local network so we need
# certificates to run it
if ! $(ls ./.next-https/certs/localhost.key 1>/dev/null 2>&1); then
  openssl req -x509 \
    -out .next-https/certs/localhost.crt \
    -keyout .next-https/certs/localhost.key \
    -days 365 \
    -newkey rsa:2048 -nodes -sha256 \
    -subj '/CN=localhost' -extensions EXT -config <( \
    printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth");
fi;
