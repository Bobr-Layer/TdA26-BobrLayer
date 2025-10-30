# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Instalace závislostí
COPY package.json package-lock.json* ./
RUN npm install

# Build aplikace
COPY . .
RUN npm run build

# Stage 2: Production
FROM nginx:alpine-slim

# Nginx konfigurace
COPY nginx.conf /etc/nginx/nginx.conf

# Kopírování build souborů (Create React App builduje do build/)
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
