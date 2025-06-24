FROM node:20.18-bookworm-slim  


# Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app


COPY package*.json ./
COPY tsconfig.json ./
COPY .env ./


RUN npm install


COPY . .

# Verifica se os arquivos existem antes de dar permissão
RUN ls -la docker/ || echo "Pasta docker não encontrada"
RUN ls -la docker/entrypoint.sh || echo "entrypoint.sh não encontrado"
RUN ls -la docker/wait-for-it.sh || echo "wait-for-it.sh não encontrado"

# Copia os scripts condicionalmente
RUN if [ -f "docker/entrypoint.sh" ]; then \
        cp docker/entrypoint.sh ./entrypoint.sh && \
        chmod +x entrypoint.sh; \
    fi

RUN if [ -f "docker/wait-for-it.sh" ]; then \
        cp docker/wait-for-it.sh ./wait-for-it.sh && \
        chmod +x wait-for-it.sh; \
    fi


RUN npx prisma generate

RUN npm run build

EXPOSE $PORT

ENTRYPOINT ["./entrypoint.sh"]