FROM node:18.14-alpine3.17

RUN apk add --no-cache git make gcc g++ bash curl

ADD package.json /tmp/package.json
ADD package-lock.json /tmp/package-lock.json
RUN cd /tmp && npm install
RUN mkdir -p /app && cp -a /tmp/node_modules /app/

RUN apk del git make gcc g++

WORKDIR /app
ADD . ./
RUN npm run build

RUN tar -cf build.tar dist
