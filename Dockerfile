FROM mhart/alpine-node:8.11.1

RUN apk add --no-cache python git make gcc g++ bash curl

ADD package.json /tmp/package.json
ADD package-lock.json /tmp/package-lock.json
RUN cd /tmp && npm install
RUN mkdir -p /app && cp -a /tmp/node_modules /app/

RUN apk del python git make gcc g++

WORKDIR /app
ADD . ./
RUN npm run build

RUN tar -cf build.tar public
