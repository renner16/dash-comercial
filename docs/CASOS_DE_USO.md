# 📋 Casos de Uso

## Cenários Práticos de Uso da Plataforma

---

## 1. 🎯 Registrar uma Nova Venda

**Ator:** Vendedor (qualquer um)

**Fluxo:**
1. Acessar sua aba individual (ex: Geovana)
2. Clicar no botão "Nova Venda"
3. Preencher o formulário:
   - Data: Selecionar data da venda
   - Nome: Nome completo do cliente
   - Email: Email do cliente
   - Valor: Valor em reais (ex: 25000)
   - Status: Selecionar "CONFIRMADA"
   - Observação: Adicionar notas (opcional)
4. Clicar em "Criar"

**Resultado:**
- Venda aparece na tabela
- KPIs são recalculados automaticamente
- Comissão é atualizada se a venda for CONFIRMADA
- Gráficos são atualizados

---

## 2. 📊 Ver Comissão do Mês

**Ator:** Vendedor

**Fluxo:**
1. Acessar sua aba individual
2. Selecionar o mês/ano desejado
3. Visualizar o card "Comissão" no topo

**Informações exibidas:**
- Valor total da comissão
- Alíquota aplicada (ex: 8%)
- Faixa de faturamento atual

**Exemplo:**
```
Faturamento: R$ 55.000,00
Cargo: PLENO
Faixa: R$ 50.001 - R$ 60.000
Alíquota: 8%
Comissão: R$ 4.400,00
```

---

## 3. 🔄 Estornar uma Venda

**Ator:** Vendedor ou Gestor

**Fluxo:**
1. Acessar a aba do vendedor
2. Localizar a venda na tabela
3. Clicar no ícone de editar (lápis)
4. Alterar status para "ESTORNADA"
5. Adicionar observação explicando o motivo
6. Salvar

**Resultado:**
- Venda sai do cálculo de faturamento
- Comissão é recalculada (pode mudar de faixa!)
- KPIs são atualizados
- Venda continua visível na tabela com tag vermelha

**⚠️ Importante:**
Se o estorno fizer o faturamento cair para outra faixa, a comissão de TODAS as vendas do mês será recalculada com a nova alíquota.

---

## 4. 📈 Registrar Relatório Diário

**Ator:** Vendedor

**Fluxo:**
1. Acessar sua aba individual
2. Clicar em "Relatório Diário"
3. Preencher:
   - Data: Dia do relatório
   - Leads Recebidos: Quantidade de leads
   - Respostas Enviadas: Quantidade de respostas
   - Vendas: Número de vendas fechadas
   - Observação: Notas sobre o dia
4. Salvar

**Resultado:**
- Relatório é salvo
- Gráficos de "Leads Recebidos" e "Respostas Enviadas" são atualizados
- Dados aparecem na visão consolidada (Geral)

**Nota:** Se já existe relatório para aquele dia, ele será atualizado automaticamente.

---

## 5. 📊 Analisar Performance do Time

**Ator:** Gestor/Coordenador

**Fluxo:**
1. Acessar a aba "Geral"
2. Selecionar o mês/ano
3. Visualizar KPIs consolidados:
   - Faturamento total do time
   - Quantidade total de vendas
   - Ticket médio geral
4. Analisar gráficos:
   - Evolução do faturamento ao longo do mês
   - Distribuição de vendas por dia
   - Atividade do time (leads e respostas)

**Filtros disponíveis:**
- Filtrar tabela por vendedor específico
- Buscar vendas por nome/email do cliente

---

## 6. 🎯 Planejamento de Metas

**Cenário:** Vendedor quer atingir a próxima faixa de comissão

**Exemplo - Matheus (JUNIOR):**

Situação atual:
- Faturamento: R$ 38.000
- Faixa atual: 0-40k (2%)
- Comissão atual: R$ 760

Para alcançar próxima faixa:
- Precisa vender: R$ 2.001 a mais
- Nova faixa: 40k-50k (3%)
- Nova comissão: R$ 1.200 (sobre 40k) + bônus

**Ação:**
- Acompanhar diariamente o dashboard
- Priorizar fechamento de negócios até fim do mês
- Registrar todas as vendas imediatamente

---

## 7. 🔍 Consultar Histórico

**Fluxo:**
1. Acessar aba do vendedor
2. Alterar o seletor de período para mês anterior
3. Visualizar histórico completo:
   - Vendas realizadas
   - Faturamento do mês
   - Comissão recebida
   - Relatórios diários

**Uso prático:**
- Comparar performance mês a mês
- Identificar sazonalidades
- Justificar bonificações
- Preparar reuniões 1:1

---

## 8. 📧 Identificar Cliente

**Cenário:** Cliente entra em contato e você precisa verificar a venda

**Fluxo:**
1. Acessar sua aba ou a aba "Geral"
2. Usar o campo de busca da tabela
3. Digitar nome ou email do cliente
4. Visualizar detalhes da venda:
   - Data
   - Valor
   - Status
   - Observações anteriores

---

## 9. 🎨 Acompanhar Evolução Diária

**Rotina sugerida para vendedores:**

### Manhã (09:00)
1. Acessar dashboard
2. Registrar relatório do dia anterior (se não fez)
3. Verificar metas do mês

### Durante o dia
1. Registrar vendas assim que fechadas
2. Marcar vendas pendentes aguardando confirmação

### Fim do dia (18:00)
1. Registrar relatório diário
2. Atualizar status de vendas pendentes
3. Revisar progresso da comissão

---

## 10. 📱 Análise Rápida no Mobile

**Fluxo mobile:**
1. Acessar pelo navegador do celular
2. Interface responsiva se adapta
3. Ver KPIs principais em cards grandes
4. Registrar venda rápida pelo celular
5. Checar comissão do mês

**Dicas:**
- Adicionar à tela inicial do celular (PWA-like)
- Usar landscape para ver gráficos melhor
- Tabelas têm scroll horizontal

---

## 11. 🚨 Correção de Erro

**Cenário:** Valor ou dados da venda foram inseridos incorretamente

**Fluxo:**
1. Localizar a venda na tabela
2. Clicar no ícone de editar
3. Corrigir os dados:
   - Valor
   - Data
   - Status
   - Observação
4. Salvar

**Resultado:**
- Venda é atualizada
- Comissão é recalculada automaticamente
- Histórico não mantém versões antigas (edição direta)

---

## 12. 🗑️ Excluir Venda Duplicada

**Cenário:** Venda foi registrada duas vezes por engano

**Fluxo:**
1. Identificar a venda duplicada
2. Clicar no ícone de lixeira (vermelho)
3. Confirmar exclusão
4. Venda é removida permanentemente

**⚠️ Atenção:**
- Exclusão é irreversível
- Use "ESTORNADA" se quiser manter histórico
- Comissão é recalculada após exclusão

---

## 13. 📊 Preparar Relatório para Reunião

**Cenário:** Gestor precisa apresentar resultados do time

**Fluxo:**
1. Acessar aba "Geral"
2. Selecionar o período desejado
3. Capturar dados:
   - Faturamento total
   - Número de vendas
   - Ticket médio
4. Exportar gráficos (screenshot)
5. Analisar cada vendedor individualmente

**Métricas chave:**
- Faturamento individual vs. time
- Conversão (leads → vendas)
- Taxa de resposta
- Evolução mês a mês

---

## 14. 🎯 Venda Pendente → Confirmada

**Cenário:** Cliente confirmou pagamento de venda que estava pendente

**Fluxo:**
1. Acessar aba do vendedor
2. Localizar venda com status "PENDENTE"
3. Editar a venda
4. Alterar status para "CONFIRMADA"
5. Salvar

**Resultado:**
- Venda agora conta no faturamento
- Comissão é recalculada
- Pode mudar de faixa se estiver no limite

---

## 15. 📈 Acompanhar Progresso Semanal

**Rotina semanal:**

1. **Segunda-feira:**
   - Ver faturamento da semana anterior
   - Definir meta da semana

2. **Quarta-feira:**
   - Check-point do meio da semana
   - Ajustar estratégia se necessário

3. **Sexta-feira:**
   - Fechar relatórios da semana
   - Verificar se bateu a meta
   - Planejar próxima semana

---

## Dicas Gerais de Uso

### ✅ Boas Práticas
- Registre vendas imediatamente após fechamento
- Preencha observações para contexto futuro
- Revise relatórios diários ao fim do expediente
- Use status PENDENTE para vendas não confirmadas
- Mantenha email dos clientes correto para busca

### ❌ Evite
- Deixar vendas sem registrar
- Esquecer de atualizar status de PENDENTE
- Excluir vendas sem necessidade (use ESTORNADA)
- Registrar valores errados (dificulta planejamento)

---

## Suporte e Dúvidas

Para dúvidas sobre:
- **Comissão:** Consulte o [Plano de Carreira](https://plano-carreira-vercel-3izbxmi3g-ygors-projects-4796f89e.vercel.app/)
- **Técnicas:** Veja o [README.md](../README.md)
- **APIs:** Consulte [API.md](./API.md)







