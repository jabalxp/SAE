FROM node:18-alpine

WORKDIR /app

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm install --production

# Copiar o servidor e banco de dados
COPY server.js ./
COPY database.js ./

# Criar diretório para o banco SQLite
RUN mkdir -p /data

# Variável de ambiente para o caminho do banco
ENV DATABASE_PATH=/data/steamtrack.db

# Expor porta
EXPOSE 3000

# Iniciar servidor
CMD ["node", "server.js"]
