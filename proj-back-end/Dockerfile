FROM node:10-alpine

ENV NODE_ENV production

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

COPY .env .env

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 5000

CMD [ "npm", "start" ]