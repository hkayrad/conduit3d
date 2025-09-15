FROM node:lts AS build

WORKDIR /src

COPY "Client/package.json" "Client/package-lock.json" ./

RUN npm install

COPY "Client/" .

ARG VITE_API_URL
ARG VITE_TILE_SERVER_URL
ARG VITE_ENVIRONMENT

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_TILE_SERVER_URL=${VITE_TILE_SERVER_URL}
ENV VITE_ENVIRONMENT=${VITE_ENVIRONMENT}

RUN npm run build

FROM node:lts AS final

WORKDIR /app

COPY --from=build /src/dist ./dist

RUN npm i -g serve

EXPOSE 3000

CMD [ "serve", "-s", "dist" ]