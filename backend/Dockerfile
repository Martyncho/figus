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
EXPOSE 8080

# Iniciar servidor con logs completos
CMD ["sh", "-c", "exec node simple-server.js 2>&1 | tee /dev/stderr"]
