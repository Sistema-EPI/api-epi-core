## 🚀 Scripts Disponíveis

```bash
# Formatação
npm run format          # Formatar todos os arquivos
npm run format:check    # Verificar se arquivos estão formatados

# Linting
npm run lint            # Executar ESLint e mostrar problemas
npm run lint:fix        # Corrigir problemas automaticamente quando possível

# Verificação de tipos
npm run typecheck       # Verificar tipos TypeScript

# Comandos combinados
npm run code:check      # Verificar tipos + lint + formatação
npm run code:fix        # Corrigir tipos + lint + formatação
```

## 📝 Workflow para Desenvolvedores

### 1. Configuração Inicial

```bash
# Instalar dependências
npm install

# Configurar hooks do git
npm run prepare
```

### 2. Durante o Desenvolvimento

- O VS Code irá formatar automaticamente ao salvar
- Execute `npm run code:check` periodicamente para verificar problemas
- Use `npm run code:fix` para corrigir problemas automaticamente

### 3. Antes do Commit

- O pre-commit hook executará automaticamente
- Se houver erros, corrija-os manualmente e faça commit novamente
- Para pular o hook (não recomendado): `git commit --no-verify`

### 4. Comandos Úteis

```bash
# Verificar todos os problemas sem corrigir
npm run code:check

# Corrigir problemas automaticamente
npm run code:fix

# Apenas formatar código
npm run format

# Apenas verificar linting
npm run lint
```

## 🚨 Resolução de Problemas Comuns

### Erro: "Prettier/prettier"

- Execute `npm run format` para formatar o código
- Configure seu editor para formatar ao salvar

### Erro: "Missing trailing comma"

- Execute `npm run format` - o Prettier irá adicionar automaticamente

### Erro: "Unexpected any"

- Substitua `any` por tipos específicos
- Use `unknown` se o tipo for realmente desconhecido
- Para casos específicos, use
  `// eslint-disable-next-line @typescript-eslint/no-explicit-any`

### Erro: "Variable is defined but never used"

- Remova variáveis não utilizadas
- Para parâmetros necessários mas não utilizados, prefixe com `_`: `_unused`

### Pre-commit hook falha

1. Execute `npm run code:fix`
2. Corrija erros restantes manualmente
3. Adicione arquivos corrigidos: `git add .`
4. Faça commit novamente
