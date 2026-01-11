// Utilitários para exportação de dados

export function exportarParaCSV(dados: any[], nomeArquivo: string) {
  if (!dados || dados.length === 0) {
    alert('Não há dados para exportar!')
    return
  }

  // Pegar as chaves do primeiro objeto como headers
  const headers = Object.keys(dados[0])
  
  // Criar linhas do CSV
  const linhasCSV = dados.map(item => {
    return headers.map(header => {
      const valor = item[header]
      
      // Tratar valores com vírgula/aspas
      if (typeof valor === 'string' && (valor.includes(',') || valor.includes('"'))) {
        return `"${valor.replace(/"/g, '""')}"`
      }
      
      return valor ?? ''
    }).join(',')
  })

  // Montar CSV completo
  const csv = [
    headers.join(','),
    ...linhasCSV
  ].join('\n')

  // Criar BOM para UTF-8 (compatibilidade com Excel/Google Sheets)
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
  
  // Fazer download
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', nomeArquivo)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function formatarVendasParaExport(vendas: any[]) {
  return vendas.map(venda => ({
    Data: venda.data,
    Nome: venda.nome,
    Email: venda.email,
    Valor: venda.valor,
    Status: venda.status,
    Cupom: venda.cupom || '',
    Plano: venda.plano || '',
    Observacao: venda.observacao || ''
  }))
}

export function formatarRelatoriosParaExport(relatorios: any[]) {
  return relatorios.map(relatorio => ({
    Data: relatorio.data,
    'Leads Recebidos': relatorio.leadsRecebidos,
    'Respostas Enviadas': relatorio.respostasEnviadas,
    'Vendas Realizadas': relatorio.vendasRealizadas,
    'Taxa de Resposta (%)': relatorio.leadsRecebidos > 0 
      ? ((relatorio.respostasEnviadas / relatorio.leadsRecebidos) * 100).toFixed(2)
      : '0.00',
    Observacao: relatorio.observacao || ''
  }))
}






