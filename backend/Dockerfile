FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copiar código fuente
COPY src ./src
COPY tsconfig.json ./
COPY simple-server.js ./

# Exposer puerto
EXPOSE 3000

# Iniciar servidor simple para debug
CMD ["node", "simple-server.js"]
