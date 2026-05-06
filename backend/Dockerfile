FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copiar código fuente
COPY src ./src
COPY tsconfig.json ./

# Copiar script de entrada
COPY entrypoint.sh ./

# Build TypeScript
RUN npm run build

# Exposer puerto
EXPOSE 3000

# Iniciar servidor directamente con IPv4 preference
CMD ["node", "--dns-result-order=ipv4first", "dist/server.js"]
