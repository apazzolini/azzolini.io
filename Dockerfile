FROM mhart/alpine-node:6.10.0
RUN npm install --global yarn

RUN apk add --no-cache python git make gcc g++ krb5-dev bash curl

ADD package.json /tmp/package.json
ADD yarn.lock /tmp/yarn.lock
RUN cd /tmp && yarn install
RUN mkdir -p /app && cp -a /tmp/node_modules /app/

RUN apk del python git make gcc g++

WORKDIR /app
ADD . ./
RUN yarn run build

CMD yarn run start
