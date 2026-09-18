FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm run build

FROM nginx:alpine AS runner

# Copiar build de la aplicación Vite
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar plantilla y configuración por defecto de Nginx
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Variables de entorno por defecto (compatibles con Docker Compose local y sobrescribibles en Railway)
ENV PORT=80
ENV BACKEND_URL=http://backend:3000
ENV NGINX_ENTRYPOINT_LOCAL_RESOLVERS=true
ENV NGINX_LOCAL_RESOLVERS="127.0.0.11 8.8.8.8 1.1.1.1"
ENV NGINX_ENVSUBST_VARS='$PORT $BACKEND_URL $NGINX_LOCAL_RESOLVERS'

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

