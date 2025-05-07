# Use uma imagem base do Node.js
FROM node:18

# Defina o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copie os arquivos de configuração e dependências
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie o restante do código da aplicação
COPY . .

# Compile o código TypeScript
RUN npx prisma generate
RUN npm run build


# Exponha a porta que a API REST usará
EXPOSE 8000

# Comando para iniciar a aplicação
CMD ["node", "dist/server.js"]

