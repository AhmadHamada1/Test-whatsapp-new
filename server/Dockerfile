# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app

ENV NODE_ENV=production
# Skip Chromium download for puppeteer during install (whatsapp-web.js)
ENV PUPPETEER_SKIP_DOWNLOAD=true

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY ./*.js ./

EXPOSE 6662

CMD ["node", "src/index.js"]
