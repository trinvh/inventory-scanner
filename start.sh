#!/bin/sh

/usr/local/bin/npx --yes prisma migrate deploy

/usr/local/bin/node server.js
