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

# Make entrypoint executable
RUN chmod +x ./entrypoint.sh

# Exposer puerto
EXPOSE 3000

# Iniciar servidor usando script que fuerza IPv4
CMD ["./entrypoint.sh"]
