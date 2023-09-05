FROM node:lts-alpine

WORKDIR /app

COPY client/package*.json /app/client/
RUN npm install --prefix /app/client

COPY server/package*.json /app/server/
RUN npm install --only=production --prefix /app/server

COPY client/ /app/client/
RUN npm run build --prefix /app/client

COPY server/ /app/server/

USER node

CMD [ "npm", "start", "--prefix", "/app/server" ]

EXPOSE 8000