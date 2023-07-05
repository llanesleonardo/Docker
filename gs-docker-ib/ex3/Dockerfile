# syntax=docker/dockerfile:1

FROM node:18-alpine as base

WORKDIR /ex3
COPY ["package.json","package-lock.json*","./"]

FROM base as test
RUN npm ci
COPY . .
RUN npm run test

FROM base as prod
ENV NODE_ENV=production
RUN npm ci --production
COPY . .
CMD ["node", "src/index.js"]