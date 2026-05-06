FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copiar código fuente
COPY src ./src
COPY tsconfig.json ./

# Build TypeScript
RUN npm run build

# Exposer puerto
EXPOSE 3000

# Iniciar servidor con flag para preferir IPv4
CMD ["node", "--dns-result-order=ipv4first", "dist/server.js"]
