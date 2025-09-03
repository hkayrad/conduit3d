# This is the newer version

FROM node:lts

WORKDIR /app

COPY package.json .

RUN npm install

RUN npm i -g serve

COPY . .

WORKDIR "/app/Client"

RUN npm run build

EXPOSE 3000

CMD [ "serve", "-s", "dist" ]