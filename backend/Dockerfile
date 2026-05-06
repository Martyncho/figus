FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Install dependencies
RUN npm install --production=false

# Copiar código fuente
COPY src ./src
COPY tsconfig.json ./

# Build TypeScript
RUN npm run build

# Remover devDependencies para imagen más pequeña
RUN npm prune --production

# Exposer puerto
EXPOSE 3000

# Iniciar servidor
# Railway setea PORT automáticamente
CMD ["npm", "start"]
