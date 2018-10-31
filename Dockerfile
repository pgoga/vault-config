FROM node:8-alpine

WORKDIR /usr/app
COPY . /usr/app

RUN yarn

CMD yarn vault-config
