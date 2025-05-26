const { executeQuery } = require("../db")

const htmlErro = (message) => `
    <html>
    <head>
        <title>Erro</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 h-screen flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <h1 class="text-2xl font-bold text-red-600 mb-4">Erro ao processar a solicitação</h1>
            <p class="text-gray-600 mb-4">Ocorreu um erro ao processar a sua solicitação.</p>
            <div class="bg-gray-100 p-4 rounded text-sm text-gray-700 font-mono overflow-auto max-h-40 mb-4">
                ${message}
            </div>
            <a href="/" class="block text-center bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Voltar ao Menu</a>
        </div>
    </body>
    </html>
`

const htmlTable = (title, tableHeaders, tableRows, description = "") => `
    <html>
    <head>
        <title>${title}</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 p-8">
        <div class="bg-white p-6 rounded-lg shadow-md">
            <h1 class="text-3xl font-bold mb-2 text-indigo-800">${title}</h1>
            ${description ? `<p class="text-gray-600 mb-6">${description}</p>` : ""}
            <div class="overflow-x-auto">
                <table class="table-auto w-full border-collapse border border-gray-300">
                    <thead>
                        <tr class="bg-indigo-50">
                            ${tableHeaders}
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
            <div class="mt-6 flex gap-4">
                <a href="/" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Voltar ao Menu</a>
                <button onclick="window.print()" class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Imprimir</button>
            </div>
        </div>
    </body>
    </html>
`

const setTableRows = (dados) => {
  if (!dados || dados.length === 0) {
    return '<tr><td colspan="100%" class="px-4 py-8 text-center text-gray-500">Nenhum dado encontrado</td></tr>'
  }

  return dados
    .map((item, index) => {
      const rowClass = index % 2 === 0 ? "bg-white" : "bg-gray-50"
      return `
            <tr class="${rowClass} border-b hover:bg-indigo-50">
                ${Object.values(item)
                  .map((value) => {
                    let displayValue = value ?? ""
                    if (typeof value === "string" && value.includes("T")) {
                      try {
                        const date = new Date(value)
                        if (!isNaN(date.getTime())) {
                          displayValue = date.toLocaleDateString("pt-PT")
                        }
                      } catch (e) {
                      }
                    }
                    return `<td class="px-4 py-3 text-sm">${displayValue}</td>`
                  })
                  .join("")}
            </tr>
        `
    })
    .join("")
}

const setTableHeaders = (dados) => {
  if (!dados || dados.length === 0) {
    return '<th class="px-4 py-3 text-left font-semibold text-gray-700">Sem dados</th>'
  }

  return Object.keys(dados[0])
    .map((key) => {
      const formattedKey = key
        .replace(/_/g, " ")
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())

      return `<th class="px-4 py-3 text-left font-semibold text-gray-700 bg-indigo-100">${formattedKey}</th>`
    })
    .join("")
}

async function listagemRoutes(fastify) {
    
  //========== APLICAÇÃO 1: PRODUÇÃO ==========
  fastify.get("/listagem/vinhas_producao", async (request, reply) => {
    try {
      const query = `
                SELECT 
                    v.id,
                    v.localizacao,
                    r.nome AS regiao,
                    cp.nome AS casta_predominante,
                    cp.tipo AS tipo_casta_predominante,
                    STRING_AGG(c.nome, ', ') WITHIN GROUP (ORDER BY c.nome) AS todas_castas,
                    COUNT(DISTINCT cv.colheitaId) AS total_colheitas
                FROM dbo.vinha v
                INNER JOIN dbo.regiao r ON v.regiaoId = r.id
                INNER JOIN dbo.casta cp ON v.castaPredominanteId = cp.id
                LEFT JOIN dbo.vinha_casta vc ON v.id = vc.vinhaId
                LEFT JOIN dbo.casta c ON vc.castaId = c.id
                LEFT JOIN dbo.colheita_vinha cv ON v.id = cv.vinhaId
                WHERE v.deleted_at IS NULL
                GROUP BY v.id, v.localizacao, r.nome, cp.nome, cp.tipo
                ORDER BY r.nome, v.localizacao
            `
      const result = await executeQuery(query)
      const dados = result.recordset

      const tableRows = setTableRows(dados)
      const tableHeaders = setTableHeaders(dados)

      reply
        .type("text/html")
        .send(
          htmlTable(
            "Gestão de Vinhas - Produção",
            tableHeaders,
            tableRows,
            "Informações detalhadas sobre vinhas, suas localizações, castas e histórico de colheitas.",
          ),
        )
    } catch (err) {
      console.error("Erro na rota /listagem/vinhas_producao:", err)
      reply.type("text/html").code(500).send(htmlErro(err.message))
    }
  })

  fastify.get("/listagem/colheitas_anuais", async (request, reply) => {
    try {
      const query = `
                SELECT 
                    c.ano,
                    c.qualidade,
                    SUM(c.quantidade) AS quantidade_total,
                    COUNT(DISTINCT cv.vinhaId) AS vinhas_envolvidas,
                    AVG(c.quantidade) AS media_por_vinha,
                    r.nome AS regiao_principal
                FROM dbo.colheita c
                INNER JOIN dbo.colheita_vinha cv ON c.id = cv.colheitaId
                INNER JOIN dbo.vinha v ON cv.vinhaId = v.id
                INNER JOIN dbo.regiao r ON v.regiaoId = r.id
                GROUP BY c.ano, c.qualidade, r.nome
                ORDER BY c.ano DESC, quantidade_total DESC
            `
      const result = await executeQuery(query)
      const dados = result.recordset

      const tableRows = setTableRows(dados)
      const tableHeaders = setTableHeaders(dados)

      reply
        .type("text/html")
        .send(
          htmlTable(
            "Histórico de Colheitas Anuais",
            tableHeaders,
            tableRows,
            "Análise da produção anual de uvas por qualidade e região.",
          ),
        )
    } catch (err) {
      console.error("Erro na rota /listagem/colheitas_anuais:", err)
      reply.type("text/html").code(500).send(htmlErro(err.message))
    }
  })

  fastify.get("/listagem/producao_por_regiao", async (request, reply) => {
    try {
      const query = `
                SELECT 
                    r.nome AS regiao,
                    COUNT(DISTINCT v.id) AS total_vinhos,
                    COUNT(DISTINCT CASE WHEN v.tipo = 'Tinto' THEN v.id END) AS vinhos_tintos,
                    COUNT(DISTINCT CASE WHEN v.tipo = 'Branco' THEN v.id END) AS vinhos_brancos,
                    COUNT(DISTINCT CASE WHEN v.tipo = 'Rosé' THEN v.id END) AS vinhos_rose,
                    COUNT(DISTINCT CASE WHEN v.tipo = 'Espumante' THEN v.id END) AS vinhos_espumante,
                    COUNT(DISTINCT l.id) AS total_lotes,
                    SUM(l.num_garrafas) AS total_garrafas_produzidas,
                    AVG(v.teor_alcoolico) AS teor_alcoolico_medio
                FROM dbo.regiao r
                LEFT JOIN dbo.vinho v ON r.id = v.regiaoId AND v.deleted_at IS NULL
                LEFT JOIN dbo.lote l ON v.id = l.vinhoId
                GROUP BY r.nome
                ORDER BY total_vinhos DESC, total_garrafas_produzidas DESC
            `
      const result = await executeQuery(query)
      const dados = result.recordset

      const tableRows = setTableRows(dados)
      const tableHeaders = setTableHeaders(dados)

      reply
        .type("text/html")
        .send(
          htmlTable(
            "Produção de Vinhos por Região",
            tableHeaders,
            tableRows,
            "Estatísticas de produção organizadas por região demarcada.",
          ),
        )
    } catch (err) {
      console.error("Erro na rota /listagem/producao_por_regiao:", err)
      reply.type("text/html").code(500).send(htmlErro(err.message))
    }
  })

  // ========== APLICAÇÃO 2: STOCK ==========

  fastify.get("/listagem/stock_lotes", async (request, reply) => {
    try {
      const query = `
                SELECT 
                    l.id AS lote_id,
                    v.nome AS vinho,
                    v.tipo AS tipo_vinho,
                    r.nome AS regiao,
                    l.ano AS ano_producao,
                    l.num_garrafas AS garrafas_produzidas,
                    l.quantidade_disponivel AS garrafas_disponiveis,
                    (l.num_garrafas - l.quantidade_disponivel) AS garrafas_vendidas,
                    CAST((CAST(l.quantidade_disponivel AS FLOAT) / l.num_garrafas * 100) AS DECIMAL(5,2)) AS percentual_disponivel,
                    l.validade,
                    CASE 
                        WHEN l.validade < GETDATE() THEN 'Vencido'
                        WHEN l.validade < DATEADD(month, 6, GETDATE()) THEN 'Próximo do Vencimento'
                        ELSE 'Válido'
                    END AS status_validade,
                    l.custo AS custo_producao
                FROM dbo.lote l
                INNER JOIN dbo.vinho v ON l.vinhoId = v.id
                INNER JOIN dbo.regiao r ON v.regiaoId = r.id
                WHERE v.deleted_at IS NULL
                ORDER BY l.quantidade_disponivel DESC, l.validade ASC
            `
      const result = await executeQuery(query)
      const dados = result.recordset

      const tableRows = setTableRows(dados)
      const tableHeaders = setTableHeaders(dados)

      reply
        .type("text/html")
        .send(
          htmlTable(
            "Gestão de Stock - Lotes",
            tableHeaders,
            tableRows,
            "Controle detalhado do stock de lotes com disponibilidade e validade.",
          ),
        )
    } catch (err) {
      console.error("Erro na rota /listagem/stock_lotes:", err)
      reply.type("text/html").code(500).send(htmlErro(err.message))
    }
  })

  fastify.get("/listagem/alertas_stock", async (request, reply) => {
    try {
      const query = `
                SELECT 
                    v.nome AS vinho,
                    r.nome AS regiao,
                    l.ano,
                    l.quantidade_disponivel AS garrafas_disponiveis,
                    l.validade,
                    CASE 
                        WHEN l.quantidade_disponivel = 0 THEN 'STOCK ESGOTADO'
                        WHEN l.quantidade_disponivel <= 50 THEN 'STOCK BAIXO'
                        WHEN l.validade < GETDATE() THEN 'PRODUTO VENCIDO'
                        WHEN l.validade < DATEADD(month, 3, GETDATE()) THEN 'PRÓXIMO DO VENCIMENTO'
                        ELSE 'OK'
                    END AS alerta,
                    CASE 
                        WHEN l.quantidade_disponivel = 0 THEN 1
                        WHEN l.validade < GETDATE() THEN 2
                        WHEN l.quantidade_disponivel <= 50 THEN 3
                        WHEN l.validade < DATEADD(month, 3, GETDATE()) THEN 4
                        ELSE 5
                    END AS prioridade
                FROM dbo.lote l
                INNER JOIN dbo.vinho v ON l.vinhoId = v.id
                INNER JOIN dbo.regiao r ON v.regiaoId = r.id
                WHERE v.deleted_at IS NULL
                  AND (l.quantidade_disponivel <= 50 
                       OR l.validade < DATEADD(month, 3, GETDATE()))
                ORDER BY prioridade ASC, l.validade ASC
            `
      const result = await executeQuery(query)
      const dados = result.recordset

      const tableRows = setTableRows(dados)
      const tableHeaders = setTableHeaders(dados)

      reply
        .type("text/html")
        .send(
          htmlTable(
            "Alertas de Stock",
            tableHeaders,
            tableRows,
            "Produtos que requerem atenção: stock baixo, vencidos ou próximos do vencimento.",
          ),
        )
    } catch (err) {
      console.error("Erro na rota /listagem/alertas_stock:", err)
      reply.type("text/html").code(500).send(htmlErro(err.message))
    }
  })

  fastify.get("/listagem/stock_por_tipo", async (request, reply) => {
    try {
      const query = `
                SELECT 
                    v.tipo AS tipo_vinho,
                    COUNT(DISTINCT l.id) AS total_lotes,
                    SUM(l.quantidade_disponivel) AS garrafas_disponiveis,
                    SUM(l.num_garrafas - l.quantidade_disponivel) AS garrafas_vendidas,
                    SUM(l.num_garrafas) AS total_garrafas_produzidas,
                    CAST(AVG(CAST(l.quantidade_disponivel AS FLOAT) / l.num_garrafas * 100) AS DECIMAL(5,2)) AS percentual_medio_disponivel,
                    COUNT(DISTINCT CASE WHEN l.validade < GETDATE() THEN l.id END) AS lotes_vencidos,
                    COUNT(DISTINCT CASE WHEN l.quantidade_disponivel = 0 THEN l.id END) AS lotes_esgotados
                FROM dbo.vinho v
                INNER JOIN dbo.lote l ON v.id = l.vinhoId
                WHERE v.deleted_at IS NULL
                GROUP BY v.tipo
                ORDER BY garrafas_disponiveis DESC
            `
      const result = await executeQuery(query)
      const dados = result.recordset

      const tableRows = setTableRows(dados)
      const tableHeaders = setTableHeaders(dados)

      reply
        .type("text/html")
        .send(
          htmlTable(
            "Stock por Tipo de Vinho",
            tableHeaders,
            tableRows,
            "Análise consolidada do stock organizada por tipo de vinho.",
          ),
        )
    } catch (err) {
      console.error("Erro na rota /listagem/stock_por_tipo:", err)
      reply.type("text/html").code(500).send(htmlErro(err.message))
    }
  })

  fastify.get("/listagem/vendas_detalhadas", async (request, reply) => {
    try {
      const query = `
                SELECT 
                    v.id AS venda_id,
                    v.data AS data_venda,
                    c.nome AS cliente,
                    c.tipo AS tipo_cliente,
                    c.nif,
                    v.tipo AS tipo_venda,
                    v.estado,
                    v.valor_total,
                    COUNT(dv.id) AS itens_vendidos,
                    SUM(dv.quantidade) AS total_garrafas,
                    STRING_AGG(
                        vi.nome + ' (' + CAST(dv.quantidade AS VARCHAR) + ' garrafas)', 
                        ', '
                    ) WITHIN GROUP (ORDER BY vi.nome) AS produtos_vendidos
                FROM dbo.venda v
                INNER JOIN dbo.cliente c ON v.clienteId = c.id
                LEFT JOIN dbo.detalhe_venda dv ON v.id = dv.vendaId
                LEFT JOIN dbo.lote l ON dv.loteId = l.id
                LEFT JOIN dbo.vinho vi ON l.vinhoId = vi.id
                GROUP BY v.id, v.data, c.nome, c.tipo, c.nif, v.tipo, v.estado, v.valor_total
                ORDER BY v.data DESC
            `
      const result = await executeQuery(query)
      const dados = result.recordset

      const tableRows = setTableRows(dados)
      const tableHeaders = setTableHeaders(dados)

      reply
        .type("text/html")
        .send(
          htmlTable(
            "Relatório de Vendas Detalhado",
            tableHeaders,
            tableRows,
            "Histórico completo de vendas com detalhes dos clientes e produtos.",
          ),
        )
    } catch (err) {
      console.error("Erro na rota /listagem/vendas_detalhadas:", err)
      reply.type("text/html").code(500).send(htmlErro(err.message))
    }
  })

  fastify.get("/listagem/analise_exportacoes", async (request, reply) => {
    try {
      const query = `
                SELECT 
                    YEAR(v.data) AS ano,
                    MONTH(v.data) AS mes,
                    COUNT(DISTINCT v.id) AS total_vendas_exportacao,
                    SUM(v.valor_total) AS faturacao_exportacao,
                    SUM(dv.quantidade) AS garrafas_exportadas,
                    COUNT(DISTINCT v.clienteId) AS clientes_exportacao,
                    AVG(v.valor_total) AS valor_medio_venda
                FROM dbo.venda v
                INNER JOIN dbo.detalhe_venda dv ON v.id = dv.vendaId
                INNER JOIN dbo.lote l ON dv.loteId = l.id
                INNER JOIN dbo.vinho vi ON l.vinhoId = vi.id
                WHERE v.tipo = 'Exportação'
                GROUP BY YEAR(v.data), MONTH(v.data)
                ORDER BY ano DESC, mes DESC
            `
      const result = await executeQuery(query)
      const dados = result.recordset

      const tableRows = setTableRows(dados)
      const tableHeaders = setTableHeaders(dados)

      reply
        .type("text/html")
        .send(
          htmlTable(
            "Análise de Exportações",
            tableHeaders,
            tableRows,
            "Estatísticas mensais de exportações com volume e faturação.",
          ),
        )
    } catch (err) {
      console.error("Erro na rota /listagem/analise_exportacoes:", err)
      reply.type("text/html").code(500).send(htmlErro(err.message))
    }
  })

  fastify.get("/listagem/perfil_clientes", async (request, reply) => {
    try {
      const query = `
                SELECT 
                    c.nome AS cliente,
                    c.tipo AS tipo_cliente,
                    c.nif,
                    c.email,
                    c.telefone,
                    COUNT(DISTINCT v.id) AS total_compras,
                    SUM(v.valor_total) AS valor_total_compras,
                    AVG(v.valor_total) AS valor_medio_compra,
                    SUM(dv.quantidade) AS total_garrafas_compradas,
                    MAX(v.data) AS ultima_compra,
                    COUNT(DISTINCT CASE WHEN v.tipo = 'Exportação' THEN v.id END) AS compras_exportacao,
                    COUNT(DISTINCT CASE WHEN v.tipo = 'Nacional' THEN v.id END) AS compras_nacionais
                FROM dbo.cliente c
                LEFT JOIN dbo.venda v ON c.id = v.clienteId
                LEFT JOIN dbo.detalhe_venda dv ON v.id = dv.vendaId
                LEFT JOIN dbo.lote l ON dv.loteId = l.id
                LEFT JOIN dbo.vinho vi ON l.vinhoId = vi.id
                GROUP BY c.id, c.nome, c.tipo, c.nif, c.email, c.telefone
            `
      const result = await executeQuery(query)
      const dados = result.recordset

      const tableRows = setTableRows(dados)
      const tableHeaders = setTableHeaders(dados)

      reply
        .type("text/html")
        .send(
          htmlTable(
            "Perfil de Clientes",
            tableHeaders,
            tableRows,
            "Análise detalhada do comportamento e histórico de compras dos clientes.",
          ),
        )
    } catch (err) {
      console.error("Erro na rota /listagem/perfil_clientes:", err)
      reply.type("text/html").code(500).send(htmlErro(err.message))
    }
  })

  fastify.get("/listagem/dashboard_executivo", async (request, reply) => {
    try {
      const query = `
                WITH VendasMensais AS (
                    SELECT 
                        YEAR(data) as ano,
                        MONTH(data) as mes,
                        SUM(valor_total) as faturacao_mensal,
                        COUNT(*) as vendas_mensais
                    FROM dbo.venda 
                    GROUP BY YEAR(data), MONTH(data)
                ),
                StockAtual AS (
                    SELECT 
                        SUM(quantidade_disponivel) as garrafas_stock,
                        COUNT(DISTINCT vinhoId) as vinhos_stock,
                        COUNT(*) as lotes_stock
                    FROM dbo.lote l
                    INNER JOIN dbo.vinho v ON l.vinhoId = v.id
                    WHERE v.deleted_at IS NULL
                ),
                ProducaoAnual AS (
                    SELECT 
                        ano,
                        SUM(num_garrafas) as garrafas_produzidas,
                        COUNT(*) as lotes_produzidos
                    FROM dbo.lote
                    GROUP BY ano
                )
                SELECT 
                    vm.ano,
                    vm.mes,
                    vm.faturacao_mensal,
                    vm.vendas_mensais,
                    sa.garrafas_stock,
                    sa.vinhos_stock,
                    sa.lotes_stock,
                    pa.garrafas_produzidas,
                    pa.lotes_produzidos
                FROM VendasMensais vm
                CROSS JOIN StockAtual sa
                LEFT JOIN ProducaoAnual pa ON vm.ano = pa.ano
                ORDER BY vm.ano DESC, vm.mes DESC
            `
      const result = await executeQuery(query)
      const dados = result.recordset

      const tableRows = setTableRows(dados)
      const tableHeaders = setTableHeaders(dados)

      reply
        .type("text/html")
        .send(
          htmlTable(
            "Dashboard Executivo",
            tableHeaders,
            tableRows,
            "Indicadores-chave de performance: vendas, stock e produção.",
          ),
        )
    } catch (err) {
      console.error("Erro na rota /listagem/dashboard_executivo:", err)
      reply.type("text/html").code(500).send(htmlErro(err.message))
    }
  })

  fastify.get("/listagem/vinhos_completo", async (request, reply) => {
    try {
      const query = `
                SELECT 
                    nome_vinho,
                    tipo_vinho,
                    teor_alcoolico,
                    regiao,
                    composicao_castas,
                    total_vendas,
                    ultima_atualizacao
                FROM dbo.v_vinho_detalhado
                WHERE data_remocao IS NULL
            `
      const result = await executeQuery(query)
      const dados = result.recordset

      const tableRows = setTableRows(dados)
      const tableHeaders = setTableHeaders(dados)

      reply
        .type("text/html")
        .send(
          htmlTable(
            "Catálogo Completo de Vinhos",
            tableHeaders,
            tableRows,
            "Informações detalhadas sobre todos os vinhos incluindo composição e vendas.",
          ),
        )
    } catch (err) {
      console.error("Erro na rota /listagem/vinhos_completo:", err)
      reply.type("text/html").code(500).send(htmlErro(err.message))
    }
  })

  fastify.get("/listagem/regioes", async (request, reply) => {
    try {
      const query = `
                SELECT 
                    r.nome AS regiao,
                    COUNT(DISTINCT v.id) AS total_vinhos,
                    COUNT(DISTINCT vh.id) AS total_vinhas,
                    r.updated_at AS ultima_atualizacao
                FROM dbo.regiao r
                LEFT JOIN dbo.vinho v ON r.id = v.regiaoId AND v.deleted_at IS NULL
                LEFT JOIN dbo.vinha vh ON r.id = vh.regiaoId AND vh.deleted_at IS NULL
                GROUP BY r.nome, r.updated_at
                ORDER BY total_vinhos DESC, total_vinhas DESC
            `
      const result = await executeQuery(query)
      const dados = result.recordset

      const tableRows = setTableRows(dados)
      const tableHeaders = setTableHeaders(dados)

      reply
        .type("text/html")
        .send(
          htmlTable(
            "Regiões Vitivinícolas",
            tableHeaders,
            tableRows,
            "Regiões demarcadas com estatísticas de vinhos e vinhas.",
          ),
        )
    } catch (err) {
      console.error("Erro na rota /listagem/regioes:", err)
      reply.type("text/html").code(500).send(htmlErro(err.message))
    }
  })

  fastify.get("/listagem/castas", async (request, reply) => {
    try {
      const query = `
                SELECT 
                    c.nome AS casta,
                    c.tipo,
                    COUNT(DISTINCT vh.id) AS vinhas_predominante,
                    COUNT(DISTINCT vc.vinhaId) AS vinhas_cultivada,
                    COUNT(DISTINCT cvc.vinhoId) AS vinhos_composicao
                FROM dbo.casta c
                LEFT JOIN dbo.vinha vh ON c.id = vh.castaPredominanteId AND vh.deleted_at IS NULL
                LEFT JOIN dbo.vinha_casta vc ON c.id = vc.castaId
                LEFT JOIN dbo.composicao_vinho_casta cvc ON c.id = cvc.castaId
                GROUP BY c.nome, c.tipo
                ORDER BY c.tipo, vinhos_composicao DESC
            `
      const result = await executeQuery(query)
      const dados = result.recordset

      const tableRows = setTableRows(dados)
      const tableHeaders = setTableHeaders(dados)

      reply
        .type("text/html")
        .send(
          htmlTable(
            "Castas de Uva",
            tableHeaders,
            tableRows,
            "Variedades de uva com estatísticas de utilização em vinhas e vinhos.",
          ),
        )
    } catch (err) {
      console.error("Erro na rota /listagem/castas:", err)
      reply.type("text/html").code(500).send(htmlErro(err.message))
    }
  })
}

module.exports = listagemRoutes
