FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json .npmrc ./
RUN npm install --legacy-peer-deps

COPY . .

ARG VITE_API_URL
ARG VITE_MEDIA_URL
ARG VITE_APP_MAP_ID

RUN echo "VITE_API_URL=${VITE_API_URL}" > .env && \
    echo "VITE_MEDIA_URL=${VITE_MEDIA_URL}" >> .env && \
    echo "VITE_APP_MAP_ID=${VITE_APP_MAP_ID}" >> .env

RUN npm run build

FROM node:20-alpine

RUN npm install -g serve

COPY --from=builder /app/dist /app/dist

EXPOSE 3000

CMD ["serve", "-s", "/app/dist", "-l", "tcp://0.0.0.0:3000"]
