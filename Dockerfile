FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS runtime

WORKDIR /app

COPY --from=build /app/dist /app/dist
COPY --from=build /app/node_modules /app/node_modules
COPY package.json .
COPY src/db ./src/db
COPY .env .

EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
