FROM node:20-alpine

RUN apk add --no-cache git make gcc g++ bash curl

ADD package.json /tmp/package.json
ADD package-lock.json /tmp/package-lock.json
RUN cd /tmp && npm install
RUN mkdir -p /app && cp -a /tmp/node_modules /app/

RUN apk del git make gcc g++

WORKDIR /app
ADD . ./
RUN npm run build

CMD [ "node", "./dist/server/entry.mjs" ]
