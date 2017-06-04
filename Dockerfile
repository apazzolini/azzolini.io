FROM mhart/alpine-node:6.10.0

RUN apk add --no-cache python git make gcc g++ krb5-dev bash curl

ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /app && cp -a /tmp/node_modules /app/

RUN apk del python git make gcc g++

WORKDIR /app
ADD . ./
RUN npm run build

CMD npm run start
