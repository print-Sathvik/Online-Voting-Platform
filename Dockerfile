FROM node:lts-alpine as base
WORKDIR /app
COPY package.json /
COPY . /app
EXPOSE 3000

FROM base as production
ENV NODE_ENV=production
RUN npm install
COPY . /app
CMD node index.js

FROM base as dev
ENV NODE_ENV=development
RUN npm install -g nodemon && npm install
COPY . /app
CMD npm run start