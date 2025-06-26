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

# Build da aplicação (sem gerar cliente Prisma ainda)
RUN npm run build

# Instalar tsx globalmente (necessário para seed após prune)
RUN npm install -g tsx

# Remover devDependencies para reduzir o tamanho da imagem
RUN npm prune --production

# Expor porta
EXPOSE $PORT

# Entrypoint
ENTRYPOINT ["./entrypoint.sh"]
