# Use uma imagem base do Node.js
FROM node:20

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
RUN chmod +x wait-for-it.sh entrypoint.sh


# Exponha a porta que a API REST usará
# EXPOSE 8888

# Comando para iniciar a aplicação
ENTRYPOINT ["./entrypoint.sh"]

