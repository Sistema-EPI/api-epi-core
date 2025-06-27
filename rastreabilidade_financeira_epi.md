# Rastreabilidade Financeira de EPI por Ano

Este documento descreve como implementar uma funcionalidade de rastreabilidade
financeira anual para controle de EPI (Equipamento de Proteção Individual),
permitindo exibir ao usuário o **total gasto em determinado EPI por ano**.

---

## 🧠 Problema

Atualmente, o sistema de entrega de EPI possui apenas os seguintes dados na
tabela `epi`:

- `quantidade` (estoque atual)
- `quantidade_minima`
- `valor` (valor unitário atual)

Entretanto, ao entregar EPIs (cadastrar um processo), apenas a `quantidade` é
decrementada. Isso faz com que **não seja possível calcular com precisão o valor
total gasto ao longo do tempo**, pois:

- O valor do EPI pode mudar.
- O sistema não guarda o histórico de movimentações nem os valores praticados na
  época da entrega.

---

## ✅ Solução: Rastreabilidade com Tabela de Movimentações

### 1. Criar uma nova tabela: `movimentacoes_epi`

Essa tabela será usada para registrar **cada movimentação de saída** do estoque,
com rastreabilidade completa:

```sql
CREATE TABLE movimentacoes_epi (
    id SERIAL PRIMARY KEY,
    epi_id INT NOT NULL,
    quantidade INT NOT NULL,
    valor_unitario DECIMAL(10,2) NOT NULL,
    data TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (epi_id) REFERENCES epi(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

> O campo `valor_unitario` deve ser preenchido com o valor vigente no momento da
> entrega.

---

### 2. Atualizar o fluxo de entrega de EPI

Ao cadastrar um processo de entrega:

- Subtrair `quantidade` do EPI como já é feito.
- **Inserir um registro em `movimentacoes_epi`**, copiando:
  - `epi_id`
  - `usuario_id`
  - `quantidade`
  - `valor_unitario` (do EPI na hora)
  - `data` (automático)

---

### 3. Consultar o total gasto por EPI anualmente

Com base nessa tabela, é possível gerar relatórios como:

**Total gasto por EPI por ano:**

```sql
SELECT
  epi_id,
  EXTRACT(YEAR FROM data) AS ano,
  SUM(quantidade * valor_unitario) AS total_gasto
FROM movimentacoes_epi
GROUP BY epi_id, EXTRACT(YEAR FROM data);
```

**Total gasto por usuário por EPI por ano:**

```sql
SELECT
  usuario_id,
  epi_id,
  EXTRACT(YEAR FROM data) AS ano,
  SUM(quantidade * valor_unitario) AS total_gasto
FROM movimentacoes_epi
GROUP BY usuario_id, epi_id, EXTRACT(YEAR FROM data);
```

---

## 🪜 Passo a passo para implementação

1. **Criar a tabela `movimentacoes_epi`** com campos conforme descrito.
2. **Alterar a lógica de entrega de EPI** para também registrar uma linha na
   tabela de movimentações.
3. **Garantir que o valor do EPI seja copiado no momento da entrega**, e não
   consultado posteriormente.
4. **Adaptar relatórios/gráficos** para utilizar os dados da nova tabela.
5. **(Opcional)** Criar testes ou logs para validar que o valor registrado está
   correto.
6. **(Opcional)** Permitir tipos de movimentação (entrada, saída, ajuste) se
   quiser um controle mais completo.

---

## 📈 Vantagens

- Rastreabilidade financeira correta, mesmo com variação de preços ao longo do
  tempo.
- Possibilidade de gerar gráficos e relatórios históricos com base nos dados
  reais.
- Preparação para auditorias e conformidade com boas práticas de gestão.

---
