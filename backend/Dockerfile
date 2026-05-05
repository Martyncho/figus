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

# Iniciar servidor
CMD ["npm", "start"]
