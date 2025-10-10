FROM node:lts AS build

WORKDIR /src

COPY Client/package.json Client/package-lock.json ./

RUN npm install --ignore-scripts

COPY Client/ .

ARG VITE_API_URL
ARG VITE_TILE_SERVER_URL
ARG VITE_ENVIRONMENT
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_TILE_SERVER_URL=${VITE_TILE_SERVER_URL}
ENV VITE_ENVIRONMENT=${VITE_ENVIRONMENT}

RUN npm run build

# Use a more minimal image for the final stage
FROM node:lts-slim AS final

WORKDIR /app

# Create a package.json to install serve locally, avoiding a global install
COPY --from=build /src/package.json ./
RUN npm install --ignore-scripts --production serve

# Copy the built application files and set ownership to the non-root 'node' user
COPY --from=build --chown=root:root --chmod=755 /src/dist ./dist

EXPOSE 3000

# Switch to the non-root user
USER node

# Run the server using the locally installed package
CMD [ "npx", "serve", "-s", "dist", "-l", "tcp://0.0.0.0:3000" ]