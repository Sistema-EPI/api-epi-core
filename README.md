# api-epi-core
---
Se quiser aplicar todas as migrations já criadas (por exemplo, em produção), use:
```bash
npx prisma migrate deploy
```
---
```bash
npx prisma migrate dev --name nome-da-migration
```
O que esse comando faz:

-Cria a migration com base nas mudanças no schema.prisma.

-Aplica a migration no banco de dados.

-Atualiza o cliente Prisma (npx prisma generate).

---
Resetar o banco (apaga tudo e refaz)
```bash
npx prisma migrate reset
```
---
### Rodar Docker Localmente

```bash
docker-compose -f docker/local-docker-compose.yml up --build -d
```
```bash
docker-compose -f docker/local-docker-compose.yml up --build
```
