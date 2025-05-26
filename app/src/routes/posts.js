const { executeQuery } = require("../db")

const htmlSucesso = (title, message, redirectUrl = "/") => `
    <html>
    <head>
        <title>${title}</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 h-screen flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <h1 class="text-2xl font-bold text-green-600 mb-4">${title}</h1>
            <p class="text-gray-600 mb-6">${message}</p>
            <div class="flex gap-4">
                <a href="${redirectUrl}" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Continuar</a>
                <a href="/" class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Menu Principal</a>
            </div>
        </div>
    </body>
    </html>
`

const htmlErro = (title, message, details = "") => `
    <html>
    <head>
        <title>${title}</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 h-screen flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <h1 class="text-2xl font-bold text-red-600 mb-4">${title}</h1>
            <p class="text-gray-600 mb-4">${message}</p>
            ${details ? `<div class="bg-gray-100 p-4 rounded text-sm text-gray-700 font-mono overflow-auto max-h-40 mb-4">${details}</div>` : ""}
            <a href="/" class="block text-center bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Voltar ao Menu</a>
        </div>
    </body>
    </html>
`

const htmlFormulario = (title, formHtml, action, description = "") => `
    <html>
    <head>
        <title>${title}</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 p-8">
        <div class="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <h1 class="text-3xl font-bold mb-4 text-indigo-800">${title}</h1>
            ${description ? `<p class="text-gray-600 mb-6">${description}</p>` : ""}
            <form method="POST" action="${action}" class="space-y-6">
                ${formHtml}
                <div class="flex gap-4">
                    <button type="submit" class="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">Submeter</button>
                    <a href="/" class="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700">Cancelar</a>
                </div>
            </form>
        </div>
    </body>
    </html>
`

const validarCamposObrigatorios = (dados, camposObrigatorios) => {
  const camposFaltantes = camposObrigatorios.filter((campo) => !dados[campo] || dados[campo].trim() === "")
  if (camposFaltantes.length > 0) {
    throw new Error(`Campos obrigatórios em falta: ${camposFaltantes.join(", ")}`)
  }
}

async function postsRoutes(fastify) {
  // ========== APLICAÇÃO 1: PRODUÇÃO ==========

  // Formulário para criar nova vinha
  fastify.get("/posts/nova_vinha", async (request, reply) => {
    try {
      const regioes = await executeQuery("SELECT id, nome FROM dbo.regiao ORDER BY nome")
      const castas = await executeQuery("SELECT id, nome, tipo FROM dbo.casta ORDER BY tipo, nome")

      const regioesOptions = regioes.recordset.map((r) => `<option value="${r.id}">${r.nome}</option>`).join("")

      const castasOptions = castas.recordset
        .map((c) => `<option value="${c.id}">${c.nome} (${c.tipo})</option>`)
        .join("")

      const formHtml = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Localização *</label>
                        <input type="text" name="localizacao" required 
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                               placeholder="Ex: Quinta do Vale, Parcela A">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Região *</label>
                        <select name="regiaoId" required 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">Selecione uma região</option>
                            ${regioesOptions}
                        </select>
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Casta Predominante *</label>
                        <select name="castaPredominanteId" required 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">Selecione uma casta</option>
                            ${castasOptions}
                        </select>
                    </div>
                </div>
            `

      reply
        .type("text/html")
        .send(
          htmlFormulario(
            "Nova Vinha",
            formHtml,
            "/posts/criar_vinha",
            "Registre uma nova vinha no sistema de produção.",
          ),
        )
    } catch (err) {
      console.error("Erro ao carregar formulário de vinha:", err)
      reply
        .type("text/html")
        .code(500)
        .send(htmlErro("Erro", "Erro ao carregar formulário", err.message))
    }
  })

  // Criar nova vinha
  fastify.post("/posts/criar_vinha", async (request, reply) => {
    try {
      const { localizacao, regiaoId, castaPredominanteId } = request.body
      validarCamposObrigatorios(request.body, ["localizacao", "regiaoId", "castaPredominanteId"])

      const query = `
                INSERT INTO dbo.vinha (localizacao, regiaoId, castaPredominanteId)
                VALUES ('${localizacao}', '${regiaoId}', '${castaPredominanteId}')
            `

      await executeQuery(query)

      reply
        .type("text/html")
        .send(
          htmlSucesso(
            "Vinha Criada",
            `Vinha "${localizacao}" foi registrada com sucesso no sistema.`,
            "/listagem/vinhas_producao",
          ),
        )
    } catch (err) {
      console.error("Erro ao criar vinha:", err)
      reply
        .type("text/html")
        .code(500)
        .send(htmlErro("Erro ao Criar Vinha", "Não foi possível criar a vinha", err.message))
    }
  })

  // Formulário para registrar colheita
  fastify.get("/posts/nova_colheita", async (request, reply) => {
    try {
      const vinhas = await executeQuery(`
                SELECT v.id, v.localizacao, r.nome as regiao 
                FROM dbo.vinha v 
                INNER JOIN dbo.regiao r ON v.regiaoId = r.id 
                WHERE v.deleted_at IS NULL 
                ORDER BY r.nome, v.localizacao
            `)

      const vinhasOptions = vinhas.recordset
        .map((v) => `<option value="${v.id}">${v.regiao} - ${v.localizacao}</option>`)
        .join("")

      const formHtml = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Ano *</label>
                        <input type="number" name="ano" required min="1900" max="${new Date().getFullYear()}"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                               value="${new Date().getFullYear()}">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Quantidade (kg) *</label>
                        <input type="number" name="quantidade" required min="0" step="0.01"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                               placeholder="Ex: 1500.50">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Qualidade *</label>
                        <select name="qualidade" required 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">Selecione a qualidade</option>
                            <option value="Alta">Alta</option>
                            <option value="Media">Média</option>
                            <option value="Baixa">Baixa</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Vinha *</label>
                        <select name="vinhaId" required 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">Selecione uma vinha</option>
                            ${vinhasOptions}
                        </select>
                    </div>
                </div>
            `

      reply
        .type("text/html")
        .send(
          htmlFormulario(
            "Registrar Colheita",
            formHtml,
            "/posts/criar_colheita",
            "Registre uma nova colheita de uvas no sistema.",
          ),
        )
    } catch (err) {
      console.error("Erro ao carregar formulário de colheita:", err)
      reply
        .type("text/html")
        .code(500)
        .send(htmlErro("Erro", "Erro ao carregar formulário", err.message))
    }
  })

  // Criar nova colheita
  fastify.post("/posts/criar_colheita", async (request, reply) => {
    try {
      const { ano, quantidade, qualidade, vinhaId } = request.body
      validarCamposObrigatorios(request.body, ["ano", "quantidade", "qualidade", "vinhaId"])

      // Criar colheita primeiro
      const colheitaQuery = `
      INSERT INTO dbo.colheita (ano, quantidade, qualidade) 
      OUTPUT INSERTED.id
      VALUES (${ano}, ${quantidade}, '${qualidade}')
    `

      const colheitaResult = await executeQuery(colheitaQuery)
      const colheitaId = colheitaResult.recordset[0].id

      // Depois associar à vinha
      const vinhaQuery = `
      INSERT INTO dbo.colheita_vinha (colheitaId, vinhaId)
      VALUES ('${colheitaId}', '${vinhaId}')
    `

      await executeQuery(vinhaQuery)

      reply
        .type("text/html")
        .send(
          htmlSucesso(
            "Colheita Registrada",
            `Colheita de ${quantidade}kg (${qualidade}) do ano ${ano} foi registrada com sucesso.`,
            "/listagem/colheitas_anuais",
          ),
        )
    } catch (err) {
      console.error("Erro ao criar colheita:", err)
      reply
        .type("text/html")
        .code(500)
        .send(htmlErro("Erro ao Registrar Colheita", "Não foi possível registrar a colheita", err.message))
    }
  })

  // Formulário para criar novo vinho
  fastify.get("/posts/novo_vinho", async (request, reply) => {
    try {
      const regioes = await executeQuery("SELECT id, nome FROM dbo.regiao ORDER BY nome")

      const regioesOptions = regioes.recordset.map((r) => `<option value="${r.id}">${r.nome}</option>`).join("")

      const formHtml = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Nome do Vinho *</label>
                        <input type="text" name="nome" required 
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                               placeholder="Ex: Quinta do Vale Reserva">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
                        <select name="tipo" required 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">Selecione o tipo</option>
                            <option value="Tinto">Tinto</option>
                            <option value="Branco">Branco</option>
                            <option value="Rosé">Rosé</option>
                            <option value="Espumante">Espumante</option>
                            <option value="Doce">Doce</option>
                            <option value="Seco">Seco</option>
                            <option value="Meio-Seco">Meio-Seco</option>
                            <option value="Meio-Doce">Meio-Doce</option>
                            <option value="Licoroso">Licoroso</option>
                            <option value="Fortificado">Fortificado</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Teor Alcoólico (%) *</label>
                        <input type="number" name="teor_alcoolico" required min="0" max="100" step="0.1"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                               placeholder="Ex: 13.5">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Região *</label>
                        <select name="regiaoId" required 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">Selecione uma região</option>
                            ${regioesOptions}
                        </select>
                    </div>
                </div>
            `

      reply
        .type("text/html")
        .send(
          htmlFormulario(
            "Novo Vinho",
            formHtml,
            "/posts/criar_vinho",
            "Registre um novo vinho no catálogo de produtos.",
          ),
        )
    } catch (err) {
      console.error("Erro ao carregar formulário de vinho:", err)
      reply
        .type("text/html")
        .code(500)
        .send(htmlErro("Erro", "Erro ao carregar formulário", err.message))
    }
  })

  // Criar novo vinho
  fastify.post("/posts/criar_vinho", async (request, reply) => {
    try {
      const { nome, tipo, teor_alcoolico, regiaoId } = request.body
      validarCamposObrigatorios(request.body, ["nome", "tipo", "teor_alcoolico", "regiaoId"])

      const query = `
                INSERT INTO dbo.vinho (nome, tipo, teor_alcoolico, regiaoId)
                VALUES ('${nome}', '${tipo}', ${teor_alcoolico}, '${regiaoId}')
            `

      await executeQuery(query)

      reply
        .type("text/html")
        .send(
          htmlSucesso(
            "Vinho Criado",
            `Vinho "${nome}" (${tipo}) foi registrado com sucesso no catálogo.`,
            "/listagem/vinhos_completo",
          ),
        )
    } catch (err) {
      console.error("Erro ao criar vinho:", err)
      reply
        .type("text/html")
        .code(500)
        .send(htmlErro("Erro ao Criar Vinho", "Não foi possível criar o vinho", err.message))
    }
  })

  // ========== APLICAÇÃO 2: STOCK ==========

  // Formulário para criar novo lote
  fastify.get("/posts/novo_lote", async (request, reply) => {
    try {
      const vinhos = await executeQuery(`
                SELECT v.id, v.nome, v.tipo, r.nome as regiao 
                FROM dbo.vinho v 
                INNER JOIN dbo.regiao r ON v.regiaoId = r.id 
                WHERE v.deleted_at IS NULL 
                ORDER BY v.nome
            `)

      const vinhosOptions = vinhos.recordset
        .map((v) => `<option value="${v.id}">${v.nome} (${v.tipo} - ${v.regiao})</option>`)
        .join("")

      const formHtml = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Vinho *</label>
                        <select name="vinhoId" required 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">Selecione um vinho</option>
                            ${vinhosOptions}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Ano de Produção *</label>
                        <input type="number" name="ano" required min="1900" max="${new Date().getFullYear()}"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                               value="${new Date().getFullYear()}">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Custo de Produção (€) *</label>
                        <input type="number" name="custo" required min="0" step="0.01"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                               placeholder="Ex: 2500.00">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Data de Engarrafamento *</label>
                        <input type="date" name="data_engarrafamento" required 
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Número de Garrafas *</label>
                        <input type="number" name="num_garrafas" required min="1"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                               placeholder="Ex: 1000">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Data de Validade *</label>
                        <input type="date" name="validade" required 
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    </div>
                </div>
            `

      reply
        .type("text/html")
        .send(
          htmlFormulario(
            "Novo Lote",
            formHtml,
            "/posts/criar_lote",
            "Registre um novo lote de produção no sistema de stock.",
          ),
        )
    } catch (err) {
      console.error("Erro ao carregar formulário de lote:", err)
      reply
        .type("text/html")
        .code(500)
        .send(htmlErro("Erro", "Erro ao carregar formulário", err.message))
    }
  })

  // Criar novo lote
  fastify.post("/posts/criar_lote", async (request, reply) => {
    try {
      const { vinhoId, ano, custo, data_engarrafamento, num_garrafas, validade } = request.body
      validarCamposObrigatorios(request.body, [
        "vinhoId",
        "ano",
        "custo",
        "data_engarrafamento",
        "num_garrafas",
        "validade",
      ])

      const query = `
                INSERT INTO dbo.lote (vinhoId, ano, custo, data_engarrafamento, num_garrafas, validade, quantidade_disponivel)
                VALUES ('${vinhoId}', ${ano}, ${custo}, '${data_engarrafamento}', ${num_garrafas}, '${validade}', ${num_garrafas})
            `

      await executeQuery(query)

      reply
        .type("text/html")
        .send(
          htmlSucesso(
            "Lote Criado",
            `Lote de ${num_garrafas} garrafas do ano ${ano} foi registrado com sucesso no stock.`,
            "/listagem/stock_lotes",
          ),
        )
    } catch (err) {
      console.error("Erro ao criar lote:", err)
      reply
        .type("text/html")
        .code(500)
        .send(htmlErro("Erro ao Criar Lote", "Não foi possível criar o lote", err.message))
    }
  })

  // Atualizar stock de lote
  fastify.post("/posts/atualizar_stock", async (request, reply) => {
    try {
      const { loteId, quantidade_ajuste, motivo } = request.body
      validarCamposObrigatorios(request.body, ["loteId", "quantidade_ajuste"])

      const loteAtual = await executeQuery(`
                SELECT quantidade_disponivel, num_garrafas 
                FROM dbo.lote 
                WHERE id = '${loteId}'
            `)

      if (loteAtual.recordset.length === 0) {
        throw new Error("Lote não encontrado")
      }

      const quantidadeAtual = loteAtual.recordset[0].quantidade_disponivel
      const novaQuantidade = quantidadeAtual + Number.parseInt(quantidade_ajuste)

      if (novaQuantidade < 0) {
        throw new Error("Quantidade resultante não pode ser negativa")
      }

      if (novaQuantidade > loteAtual.recordset[0].num_garrafas) {
        throw new Error("Quantidade não pode exceder o total de garrafas do lote")
      }

      await executeQuery(`
                UPDATE dbo.lote 
                SET quantidade_disponivel = ${novaQuantidade}
                WHERE id = '${loteId}'
            `)

      const tipoOperacao = quantidade_ajuste > 0 ? "Entrada" : "Saída"
      const mensagem = `${tipoOperacao} de ${Math.abs(quantidade_ajuste)} garrafas processada. Nova quantidade: ${novaQuantidade} garrafas.`

      reply.type("text/html").send(htmlSucesso("Stock Atualizado", mensagem, "/listagem/stock_lotes"))
    } catch (err) {
      console.error("Erro ao atualizar stock:", err)
      reply
        .type("text/html")
        .code(500)
        .send(htmlErro("Erro ao Atualizar Stock", "Não foi possível atualizar o stock", err.message))
    }
  })

  // ========== APLICAÇÃO 3: VENDAS ==========

  // Formulário para criar novo cliente
  fastify.get("/posts/novo_cliente", async (request, reply) => {
    try {
      const formHtml = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                        <input type="text" name="nome" required 
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                               placeholder="Ex: João Silva ou Distribuidora ABC">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Cliente *</label>
                        <select name="tipo" required 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">Selecione o tipo</option>
                            <option value="Particular">Particular</option>
                            <option value="Distribuidor">Distribuidor</option>
                            <option value="Restaurante">Restaurante</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">NIF *</label>
                        <input type="text" name="nif" required 
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                               placeholder="Ex: 123456789">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input type="email" name="email" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                               placeholder="Ex: cliente@email.com">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                        <input type="text" name="telefone" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                               placeholder="Ex: +351 912 345 678">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Morada</label>
                        <textarea name="morada" rows="3"
                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  placeholder="Morada completa do cliente"></textarea>
                    </div>
                </div>
            `

      reply
        .type("text/html")
        .send(
          htmlFormulario(
            "Novo Cliente",
            formHtml,
            "/posts/criar_cliente",
            "Registre um novo cliente no sistema de vendas.",
          ),
        )
    } catch (err) {
      console.error("Erro ao carregar formulário de cliente:", err)
      reply
        .type("text/html")
        .code(500)
        .send(htmlErro("Erro", "Erro ao carregar formulário", err.message))
    }
  })

  // Criar novo cliente
  fastify.post("/posts/criar_cliente", async (request, reply) => {
    try {
      const { nome, tipo, nif, email, telefone, morada } = request.body
      validarCamposObrigatorios(request.body, ["nome", "tipo", "nif"])

      const query = `
                INSERT INTO dbo.cliente (nome, tipo, nif, email, telefone, morada)
                VALUES ('${nome}', '${tipo}', '${nif}', 
                        ${email ? `'${email}'` : "NULL"}, 
                        ${telefone ? `'${telefone}'` : "NULL"}, 
                        ${morada ? `'${morada}'` : "NULL"})
            `

      await executeQuery(query)

      reply
        .type("text/html")
        .send(
          htmlSucesso(
            "Cliente Criado",
            `Cliente "${nome}" (${tipo}) foi registrado com sucesso no sistema.`,
            "/listagem/perfil_clientes",
          ),
        )
    } catch (err) {
      console.error("Erro ao criar cliente:", err)
      reply
        .type("text/html")
        .code(500)
        .send(htmlErro("Erro ao Criar Cliente", "Não foi possível criar o cliente", err.message))
    }
  })

  // Formulário para processar venda
  fastify.get("/posts/nova_venda", async (request, reply) => {
    try {
      const clientes = await executeQuery(`
                SELECT id, nome, tipo 
                FROM dbo.cliente 
                ORDER BY nome
            `)

      const lotes = await executeQuery(`
                SELECT l.id, v.nome as vinho, v.tipo, l.ano, l.quantidade_disponivel, r.nome as regiao
                FROM dbo.lote l
                INNER JOIN dbo.vinho v ON l.vinhoId = v.id
                INNER JOIN dbo.regiao r ON v.regiaoId = r.id
                WHERE v.deleted_at IS NULL AND l.quantidade_disponivel > 0
                ORDER BY v.nome, l.ano
            `)

      const clientesOptions = clientes.recordset
        .map((c) => `<option value="${c.id}">${c.nome} (${c.tipo})</option>`)
        .join("")

      const lotesOptions = lotes.recordset
        .map(
          (l) =>
            `<option value="${l.id}" data-disponivel="${l.quantidade_disponivel}">${l.vinho} ${l.ano} - ${l.regiao} (${l.quantidade_disponivel} disponíveis)</option>`,
        )
        .join("")

      const formHtml = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
                        <select name="clienteId" required 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">Selecione um cliente</option>
                            ${clientesOptions}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Data da Venda *</label>
                        <input type="date" name="data" required 
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                               value="${new Date().toISOString().split("T")[0]}">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Valor Total (€) *</label>
                        <input type="number" name="valor_total" required min="0" step="0.01"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                               placeholder="Ex: 150.00">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Estado *</label>
                        <select name="estado" required 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">Selecione o estado</option>
                            <option value="Pendente">Pendente</option>
                            <option value="Paga">Paga</option>
                            <option value="Entregue">Entregue</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Venda *</label>
                        <select name="tipo" required 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">Selecione o tipo</option>
                            <option value="Nacional">Nacional</option>
                            <option value="Exportação">Exportação</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Lote *</label>
                        <select name="loteId" required 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">Selecione um lote</option>
                            ${lotesOptions}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Quantidade *</label>
                        <input type="number" name="quantidade" required min="1"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                               placeholder="Número de garrafas">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Preço Unitário (€) *</label>
                        <input type="number" name="preco" required min="0" step="0.01"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                               placeholder="Ex: 15.00">
                    </div>
                </div>
            `

      reply
        .type("text/html")
        .send(htmlFormulario("Nova Venda", formHtml, "/posts/processar_venda", "Processe uma nova venda no sistema."))
    } catch (err) {
      console.error("Erro ao carregar formulário de venda:", err)
      reply
        .type("text/html")
        .code(500)
        .send(htmlErro("Erro", "Erro ao carregar formulário", err.message))
    }
  })

  // Processar nova venda - SEM ATUALIZAÇÃO MANUAL DE STOCK (o trigger faz isso)
  fastify.post("/posts/processar_venda", async (request, reply) => {
    try {
      const { clienteId, data, valor_total, estado, tipo, loteId, quantidade, preco } = request.body
      validarCamposObrigatorios(request.body, [
        "clienteId",
        "data",
        "valor_total",
        "estado",
        "tipo",
        "loteId",
        "quantidade",
        "preco",
      ])

      // Criar venda primeiro
      const vendaQuery = `
      INSERT INTO dbo.venda (clienteId, data, valor_total, estado, tipo) 
      OUTPUT INSERTED.id
      VALUES ('${clienteId}', '${data}', ${valor_total}, '${estado}', '${tipo}')
    `

      const vendaResult = await executeQuery(vendaQuery)
      const vendaId = vendaResult.recordset[0].id

      // Criar detalhe da venda - O TRIGGER ATUALIZARÁ O STOCK AUTOMATICAMENTE
      const detalheQuery = `
      INSERT INTO dbo.detalhe_venda (vendaId, loteId, quantidade, preco)
      VALUES ('${vendaId}', '${loteId}', ${quantidade}, ${preco})
    `

      await executeQuery(detalheQuery)

      reply
        .type("text/html")
        .send(
          htmlSucesso(
            "Venda Processada",
            `Venda de ${quantidade} garrafas no valor de €${valor_total} foi processada com sucesso. O stock foi atualizado automaticamente pelo sistema.`,
            "/listagem/vendas_detalhadas",
          ),
        )
    } catch (err) {
      console.error("Erro ao processar venda:", err)
      reply
        .type("text/html")
        .code(500)
        .send(htmlErro("Erro ao Processar Venda", "Não foi possível processar a venda", err.message))
    }
  })

  // ========== GESTÃO DE UTILIZADORES ==========

  // Formulário para criar utilizador
  fastify.get("/posts/novo_utilizador", async (request, reply) => {
    try {
      const formHtml = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                        <input type="text" name="nome" required 
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                               placeholder="Ex: João Silva">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                        <input type="email" name="email" required 
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                               placeholder="Ex: joao@vinhos.pt">
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Perfil de Acesso *</label>
                        <select name="perfil" required 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">Selecione o perfil</option>
                            <option value="admin">Administrador</option>
                            <option value="gestor">Gestor</option>
                            <option value="operador">Operador</option>
                        </select>
                        <p class="text-sm text-gray-500 mt-1">
                            Admin: Acesso total | Gestor: Gestão operacional | Operador: Operações básicas
                        </p>
                    </div>
                </div>
            `

      reply
        .type("text/html")
        .send(
          htmlFormulario(
            "Novo Utilizador",
            formHtml,
            "/posts/criar_utilizador",
            "Crie um novo utilizador no sistema com perfil de acesso específico.",
          ),
        )
    } catch (err) {
      console.error("Erro ao carregar formulário de utilizador:", err)
      reply
        .type("text/html")
        .code(500)
        .send(htmlErro("Erro", "Erro ao carregar formulário", err.message))
    }
  })

  // Criar utilizador
  fastify.post("/posts/criar_utilizador", async (request, reply) => {
    try {
      const { nome, email, perfil } = request.body
      validarCamposObrigatorios(request.body, ["nome", "email", "perfil"])

      const query = `
                INSERT INTO dbo.utilizador (nome, email, perfil)
                VALUES ('${nome}', '${email}', '${perfil}')
            `

      await executeQuery(query)

      reply
        .type("text/html")
        .send(
          htmlSucesso("Utilizador Criado", `Utilizador "${nome}" com perfil "${perfil}" foi criado com sucesso.`, "/"),
        )
    } catch (err) {
      console.error("Erro ao criar utilizador:", err)
      reply
        .type("text/html")
        .code(500)
        .send(htmlErro("Erro ao Criar Utilizador", "Não foi possível criar o utilizador", err.message))
    }
  })
}

module.exports = postsRoutes
