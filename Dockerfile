FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

COPY client/package*.json ./client/
RUN cd client && npm install
COPY client ./client
RUN cd client && npm run build

COPY server ./server
RUN mkdir -p server/public && cp -r client/dist/. server/public/

WORKDIR /app/server
ENV NODE_ENV=production
EXPOSE 3108
CMD ["node", "index.js"]
