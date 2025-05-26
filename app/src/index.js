const fastify = require("fastify")({ logger: true })
const path = require("path")

// Configuração manual para suportar formulários (alternativa ao plugin)
fastify.addContentTypeParser("application/x-www-form-urlencoded", (request, payload, done) => {
  let body = ""
  payload.on("data", (chunk) => {
    body += chunk.toString()
  })
  payload.on("end", () => {
    try {
      const parsed = new URLSearchParams(body)
      const result = {}
      for (const [key, value] of parsed) {
        result[key] = value
      }
      done(null, result)
    } catch (err) {
      done(err)
    }
  })
})

const listagemRoutes = require("./routes/gets")
const postsRoutes = require("./routes/posts")

fastify.register(listagemRoutes)
fastify.register(postsRoutes)

fastify.get("/", async (request, reply) => {
  const routes = [
    // APLICAÇÃO 1: PRODUÇÃO
    {
      path: "/listagem/vinhas_producao",
      title: "Gestão de Vinhas",
      description: "Vinhas com castas, localizações e histórico de colheitas",
      category: "Produção",
      icon: "🍇",
      type: "view",
    },
    {
      path: "/posts/nova_vinha",
      title: "Nova Vinha",
      description: "Registrar nova vinha no sistema",
      category: "Produção",
      icon: "➕",
      type: "form",
    },
    {
      path: "/listagem/colheitas_anuais",
      title: "Colheitas Anuais",
      description: "Histórico de colheitas por ano, qualidade e região",
      category: "Produção",
      icon: "🌾",
      type: "view",
    },
    {
      path: "/posts/nova_colheita",
      title: "Registrar Colheita",
      description: "Registrar nova colheita de uvas",
      category: "Produção",
      icon: "➕",
      type: "form",
    },
    {
      path: "/listagem/producao_por_regiao",
      title: "Produção por Região",
      description: "Estatísticas de produção organizadas por região demarcada",
      category: "Produção",
      icon: "🍷",
      type: "view",
    },
    {
      path: "/posts/novo_vinho",
      title: "Novo Vinho",
      description: "Criar novo vinho no catálogo",
      category: "Produção",
      icon: "➕",
      type: "form",
    },

    // APLICAÇÃO 2: STOCK
    {
      path: "/listagem/stock_lotes",
      title: "Stock de Lotes",
      description: "Controle detalhado do stock com disponibilidade e validade",
      category: "Stock",
      icon: "📦",
      type: "view",
    },
    {
      path: "/posts/novo_lote",
      title: "Novo Lote",
      description: "Criar novo lote de produção",
      category: "Stock",
      icon: "➕",
      type: "form",
    },
    {
      path: "/listagem/alertas_stock",
      title: "Alertas de Stock",
      description: "Produtos com stock baixo, vencidos ou próximos do vencimento",
      category: "Stock",
      icon: "⚠️",
      type: "view",
    },
    {
      path: "/listagem/stock_por_tipo",
      title: "Stock por Tipo",
      description: "Análise consolidada do stock por tipo de vinho",
      category: "Stock",
      icon: "📊",
      type: "view",
    },

    // APLICAÇÃO 3: VENDAS
    {
      path: "/listagem/vendas_detalhadas",
      title: "Vendas Detalhadas",
      description: "Histórico completo de vendas com clientes e produtos",
      category: "Vendas",
      icon: "💰",
      type: "view",
    },
    {
      path: "/posts/nova_venda",
      title: "Nova Venda",
      description: "Processar nova venda",
      category: "Vendas",
      icon: "➕",
      type: "form",
    },
    {
      path: "/listagem/analise_exportacoes",
      title: "Análise de Exportações",
      description: "Estatísticas mensais de exportações com volume e faturação",
      category: "Vendas",
      icon: "🌍",
      type: "view",
    },
    {
      path: "/listagem/perfil_clientes",
      title: "Perfil de Clientes",
      description: "Análise do comportamento e histórico de compras dos clientes",
      category: "Vendas",
      icon: "👥",
      type: "view",
    },
    {
      path: "/posts/novo_cliente",
      title: "Novo Cliente",
      description: "Registrar novo cliente",
      category: "Vendas",
      icon: "➕",
      type: "form",
    },

    // RELATÓRIOS ANALÍTICOS
    {
      path: "/listagem/dashboard_executivo",
      title: "Dashboard Executivo",
      description: "Indicadores-chave: vendas, stock e produção",
      category: "Relatórios",
      icon: "📈",
      type: "view",
    },
    {
      path: "/listagem/vinhos_completo",
      title: "Catálogo de Vinhos",
      description: "Informações detalhadas sobre todos os vinhos",
      category: "Relatórios",
      icon: "🍷",
      type: "view",
    },

    // DADOS BÁSICOS
    {
      path: "/listagem/regioes",
      title: "Regiões",
      description: "Regiões demarcadas com estatísticas",
      category: "Dados Básicos",
      icon: "🗺️",
      type: "view",
    },
    {
      path: "/listagem/castas",
      title: "Castas",
      description: "Variedades de uva com estatísticas de utilização",
      category: "Dados Básicos",
      icon: "🍇",
      type: "view",
    },

    // GESTÃO DO SISTEMA
    {
      path: "/posts/novo_utilizador",
      title: "Novo Utilizador",
      description: "Criar utilizador com perfil de acesso",
      category: "Sistema",
      icon: "👤",
      type: "form",
    },
  ]

  const routesByCategory = routes.reduce((acc, route) => {
    if (!acc[route.category]) {
      acc[route.category] = []
    }
    acc[route.category].push(route)
    return acc
  }, {})

  // Cores para cada categoria
  const categoryColors = {
    Produção: "border-green-500 bg-green-50",
    Stock: "border-blue-500 bg-blue-50",
    Vendas: "border-purple-500 bg-purple-50",
    Relatórios: "border-orange-500 bg-orange-50",
    "Dados Básicos": "border-gray-500 bg-gray-50",
    Sistema: "border-red-500 bg-red-50",
  }

  // Gerar HTML por categoria
  const categoriesHtml = Object.entries(routesByCategory)
    .map(([category, categoryRoutes]) => {
      const cardsHtml = categoryRoutes
        .map((route) => {
          const cardStyle = route.type === "form" ? "border-dashed" : "border-solid"
          const bgStyle = route.type === "form" ? "bg-gradient-to-br from-white to-gray-50" : "bg-white"

          return `
          <a href="${route.path}" class="block">
              <div class="${bgStyle} rounded-lg shadow p-4 hover:shadow-lg transition-shadow border-l-4 ${categoryColors[category]} ${cardStyle} hover:scale-105 transform transition-transform">
                  <div class="flex items-center mb-2">
                      <span class="text-2xl mr-3">${route.icon}</span>
                      <h3 class="text-lg font-semibold text-gray-800">${route.title}</h3>
                      ${route.type === "form" ? '<span class="ml-auto text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">FORM</span>' : ""}
                  </div>
                  <p class="text-gray-600 text-sm">${route.description}</p>
              </div>
          </a>
        `
        })
        .join("")

      return `
        <div class="mb-8">
          <h2 class="text-2xl font-bold mb-4 text-gray-700 border-b-2 border-gray-200 pb-2">
            ${category}
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${cardsHtml}
          </div>
        </div>
      `
    })
    .join("")

  const html = `
    <!DOCTYPE html>
    <html lang="pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vinhos Portugal, S.A. - Sistema de Gestão</title>
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    </head>
    <body class="bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
        <div class="container mx-auto px-4 py-8">
            <div class="text-center mb-12">
                <h1 class="text-5xl font-bold mb-4 text-gray-800">🍷 Vinhos Portugal, S.A.</h1>
                <p class="text-xl text-gray-600 mb-2">Sistema Integrado de Gestão Vitivinícola</p>
                <p class="text-lg text-gray-500">Produção • Stock • Vendas • Relatórios</p>
            </div>
            
            ${categoriesHtml}
            
            <div class="mt-12 text-center bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold text-gray-700 mb-2">Sobre o Sistema</h3>
                <p class="text-sm text-gray-600 mb-4">
                    Sistema desenvolvido para gestão completa da cadeia de valor do vinho, 
                    desde o cultivo até à venda, assegurando rastreabilidade e eficiência operacional.
                </p>
                <div class="flex justify-center space-x-8 text-sm text-gray-500">
                    <span>📊 Relatórios Analíticos</span>
                    <span>🔄 Controle de Stock</span>
                    <span>🌍 Gestão de Exportações</span>
                    <span>📈 Dashboard Executivo</span>
                </div>
                <div class="mt-4 text-xs text-gray-400">
                    <span class="inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded mr-2">FORM</span>
                    Formulários de entrada de dados
                </div>
            </div>
        </div>
    </body>
    </html>
    `
  reply.type("text/html").send(html)
})

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" })
    console.log(`Servidor rodando em ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
