# Workflow de Formatação e Linting

Este projeto utiliza **Prettier** e **ESLint** para manter um código consistente
e de alta qualidade.

## 🛠 Ferramentas Utilizadas

### Prettier (Formatador de Código)

- **Função**: Formatar automaticamente o código para manter consistência visual
- **Configuração**: `.prettierrc`
- **Arquivos ignorados**: `.prettierignore`

### ESLint (Linter)

- **Função**: Analisar o código em busca de erros, problemas de qualidade e
  padrões
- **Configuração**: `.eslintrc.json`
- **Arquivos ignorados**: `.eslintignore`

### Husky + lint-staged

- **Função**: Executar formatação e linting automaticamente nos commits
- **Configuração**: `.husky/pre-commit` e `package.json` (lint-staged)

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

## ⚙️ Configurações

### Prettier (`.prettierrc`)

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### ESLint (`.eslintrc.json`)

- Extends: `eslint:recommended`, `@typescript-eslint/recommended`, `prettier`
- Parser: `@typescript-eslint/parser`
- Plugins: `@typescript-eslint`, `prettier`

### Regras Principais

- ✅ Prettier formatting é obrigatório
- ⚠️ Console.log permitido apenas para warn/error
- ❌ Variáveis não utilizadas (exceto se começarem com `_`)
- ❌ Uso de `var` (usar `const`/`let`)
- ❌ Uso de `any` explícito

## 🔧 VS Code Integration

### Extensões Recomendadas

O arquivo `.vscode/extensions.json` inclui:

- ESLint
- Prettier - Code formatter

### Configurações do Workspace

O arquivo `.vscode/settings.json` configura:

- Formatação automática ao salvar
- ESLint como formatador padrão para TypeScript
- Correção automática ao salvar

## 🎯 Git Hooks

### Pre-commit Hook

Automaticamente executa:

1. **Prettier** - Formatar arquivos modificados
2. **ESLint** - Verificar e corrigir problemas quando possível

Se houver erros de linting que não podem ser corrigidos automaticamente, o
commit será **bloqueado**.

### Como funciona o lint-staged

```json
{
  "lint-staged": {
    "*.{ts,js}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
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

## 📚 Documentação Adicional

- [Prettier Documentation](https://prettier.io/docs/en/)
- [ESLint Documentation](https://eslint.org/docs/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [Husky Documentation](https://typicode.github.io/husky/)
