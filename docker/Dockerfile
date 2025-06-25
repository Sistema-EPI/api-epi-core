FROM node:20.18-bookworm-slim

# Instalar dependências do sistema necessárias para o Prisma
RUN apt-get update -y && \
    apt-get install -y \
    openssl \
    ca-certificates \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app


# Copiar arquivos de configuração primeiro (melhor cache)
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependências (incluindo devDependencies para build)
RUN npm ci --ignore-scripts --silent

# Copiar código fonte
COPY . .

# Copiar e configurar scripts se existirem
RUN if [ -f "docker/entrypoint.sh" ]; then \
        cp docker/entrypoint.sh ./entrypoint.sh && \
        chmod +x entrypoint.sh; \
    fi

RUN if [ -f "docker/wait-for-it.sh" ]; then \
        cp docker/wait-for-it.sh ./wait-for-it.sh && \
        chmod +x wait-for-it.sh; \
    fi

# Gerar cliente Prisma
RUN npx prisma generate

# Build da aplicação
RUN npm run build

# Remover devDependencies para reduzir o tamanho da imagem
RUN npm prune --production

# Expor porta
EXPOSE $PORT

# Entrypoint
ENTRYPOINT ["./entrypoint.sh"]
