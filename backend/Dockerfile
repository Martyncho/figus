FROM node:18-alpine

WORKDIR /app

# Copiar simple-server.js
COPY simple-server.js ./

# Exposer puerto - Railway asigna dinámicamente
EXPOSE 3000

# Entrypoint directo
ENTRYPOINT ["node", "simple-server.js"]
