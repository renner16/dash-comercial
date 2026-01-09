# 📡 Documentação da API

## Endpoints Disponíveis

### 🧑‍💼 Vendedores

#### `GET /api/vendedores`
Retorna todos os vendedores cadastrados.

**Resposta:**
```json
[
  {
    "id": "uuid",
    "nome": "Geovana",
    "cargo": "PLENO",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 💰 Vendas

#### `GET /api/vendas`
Lista vendas com filtros opcionais.

**Query Parameters:**
- `vendedorId` (opcional): ID do vendedor
- `mes` (opcional): Mês (1-12)
- `ano` (opcional): Ano (ex: 2024)

**Exemplo:**
```
GET /api/vendas?vendedorId=abc123&mes=1&ano=2024
```

**Resposta:**
```json
[
  {
    "id": "uuid",
    "vendedorId": "uuid",
    "data": "2024-01-15T12:00:00.000Z",
    "nome": "Cliente A",
    "email": "cliente@email.com",
    "valor": 15000,
    "status": "CONFIRMADA",
    "observacao": "Venda rápida",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z",
    "vendedor": {
      "id": "uuid",
      "nome": "Geovana",
      "cargo": "PLENO"
    }
  }
]
```

#### `POST /api/vendas`
Cria uma nova venda.

**Body:**
```json
{
  "vendedorId": "uuid",
  "data": "2024-01-15T12:00:00.000Z",
  "nome": "Cliente A",
  "email": "cliente@email.com",
  "valor": 15000,
  "status": "CONFIRMADA",
  "observacao": "Venda rápida"
}
```

#### `PUT /api/vendas/[id]`
Atualiza uma venda existente.

**Body:** (mesmo formato do POST, sem vendedorId)

#### `DELETE /api/vendas/[id]`
Exclui uma venda.

**Resposta:**
```json
{
  "success": true
}
```

---

### 📊 Relatórios Diários

#### `GET /api/relatorios`
Lista relatórios diários com filtros opcionais.

**Query Parameters:**
- `vendedorId` (opcional): ID do vendedor
- `mes` (opcional): Mês (1-12)
- `ano` (opcional): Ano (ex: 2024)

**Resposta:**
```json
[
  {
    "id": "uuid",
    "vendedorId": "uuid",
    "data": "2024-01-15T12:00:00.000Z",
    "leadsRecebidos": 15,
    "respostasEnviadas": 12,
    "vendas": 2,
    "observacao": "Bom dia de trabalho",
    "createdAt": "2024-01-15T18:00:00.000Z",
    "updatedAt": "2024-01-15T18:00:00.000Z",
    "vendedor": {
      "id": "uuid",
      "nome": "Geovana",
      "cargo": "PLENO"
    }
  }
]
```

#### `POST /api/relatorios`
Cria ou atualiza um relatório diário.

**Nota:** Se já existe um relatório para a mesma data e vendedor, ele será atualizado automaticamente.

**Body:**
```json
{
  "vendedorId": "uuid",
  "data": "2024-01-15T12:00:00.000Z",
  "leadsRecebidos": 15,
  "respostasEnviadas": 12,
  "vendas": 2,
  "observacao": "Bom dia de trabalho"
}
```

#### `PUT /api/relatorios/[id]`
Atualiza um relatório existente.

#### `DELETE /api/relatorios/[id]`
Exclui um relatório.

---

## 🔒 Autenticação

**Status:** Não implementada (conforme requisito)

Todos os endpoints são públicos. Qualquer cliente pode acessar todos os dados.

---

## 🚨 Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 500 | Erro interno do servidor |

---

## 📝 Observações

1. **Datas**: Todas as datas são armazenadas em ISO 8601 (UTC)
2. **Valores**: Valores monetários são números decimais (ex: 15000.50)
3. **Status de Venda**: Apenas "CONFIRMADA", "PENDENTE" ou "ESTORNADA"
4. **Cargo**: Apenas "JUNIOR" ou "PLENO"
5. **Unicidade**: Relatórios têm constraint único por (vendedorId, data)

---

## 🧪 Exemplos de Uso

### Criar uma venda com fetch

```javascript
const response = await fetch('/api/vendas', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    vendedorId: 'abc-123',
    data: new Date(),
    nome: 'Cliente Exemplo',
    email: 'exemplo@email.com',
    valor: 25000,
    status: 'CONFIRMADA',
    observacao: 'Cliente VIP'
  })
})

const venda = await response.json()
console.log('Venda criada:', venda)
```

### Listar vendas de um vendedor no mês

```javascript
const mes = 1
const ano = 2024
const vendedorId = 'abc-123'

const response = await fetch(
  `/api/vendas?vendedorId=${vendedorId}&mes=${mes}&ano=${ano}`
)

const vendas = await response.json()
console.log(`${vendas.length} vendas encontradas`)
```

### Atualizar status de uma venda

```javascript
const vendaId = 'xyz-789'

const response = await fetch(`/api/vendas/${vendaId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    ...vendaAtual,
    status: 'ESTORNADA'
  })
})

const vendaAtualizada = await response.json()
```

---

## 🔄 Fluxo de Comissão

A comissão **NÃO** é calculada via API. Ela é calculada no frontend usando a biblioteca `/lib/comissao.ts`.

**Exemplo:**

```typescript
import { calcularComissao, getInfoFaixa } from '@/lib/comissao'

const faturamento = 55000
const cargo = 'PLENO'

const comissao = calcularComissao(cargo, faturamento)
// Resultado: 4400 (8% de 55000)

const info = getInfoFaixa(cargo, faturamento)
// Resultado: { faixa: 3, percentual: 0.08, ... }
```

---

Para mais detalhes, consulte o código-fonte das APIs em `/app/api/`.

