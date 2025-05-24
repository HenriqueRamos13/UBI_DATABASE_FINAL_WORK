const { executeQuery } = require('../db');

async function listagemRoutes(fastify) {
    fastify.get('/listagem', async (request, reply) => {
        try {
            const tabelas = [
                'regiao', 'casta', 'vinha', 'colheita', 'vinho',
                'composicaoVinho', 'lote', 'cliente', 'venda',
                'detalheVenda', 'precoCliente', 'utilizador'
            ];

            const resultados = {};

            try {
                for (const tabela of tabelas) {
                    const query = `SELECT * FROM dbo.${tabela} WHERE deleted_at IS NULL`;
                    const result = await executeQuery(query);
                    resultados[tabela] = result.recordset;
                }
            } catch (dbError) {
                console.error('Erro ao conectar ao banco de dados:', dbError);
                return reply.code(500).send(`
                    <html>
                    <head>
                        <title>Erro de Conexão</title>
                        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
                    </head>
                    <body class="bg-gray-100 h-screen flex items-center justify-center">
                        <div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                            <h1 class="text-2xl font-bold text-red-600 mb-4">Erro de Conexão</h1>
                            <p class="text-gray-600 mb-4">Não foi possível conectar ao banco de dados.</p>
                            <div class="bg-gray-100 p-4 rounded text-sm text-gray-700 font-mono overflow-auto max-h-40 mb-4">
                                ${dbError.message}
                            </div>
                            <a href="/" class="block text-center bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Voltar ao Menu</a>
                        </div>
                    </body>
                    </html>
                `);
            }

            let html = `
            <!DOCTYPE html>
            <html lang="pt">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Listagem de Dados - Sistema de Gestão de Vinhos</title>
                <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
                <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
            </head>
            <body class="bg-gray-100" x-data="{ tabelaAtiva: 'regiao' }">
                <div class="container mx-auto px-4 py-8">
                    <div class="flex items-center justify-between mb-8">
                        <h1 class="text-3xl font-bold text-gray-800">Listagem de Dados</h1>
                        <a href="/" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Voltar ao Menu</a>
                    </div>
                    
                    <div class="mb-6">
                        <label for="tabela" class="block text-sm font-medium text-gray-700 mb-2">Selecione uma tabela:</label>
                        <select 
                            id="tabela" 
                            x-model="tabelaAtiva" 
                            class="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >`;

            for (const tabela of Object.keys(resultados)) {
                html += `<option value="${tabela}">${tabela}</option>`;
            }

            html += `
                        </select>
                    </div>
                    
                    <div class="bg-white shadow-md rounded-lg overflow-hidden">`;

            for (const tabela of Object.keys(resultados)) {
                const dados = resultados[tabela];

                html += `
                        <div x-show="tabelaAtiva === '${tabela}'" class="overflow-x-auto">
                            <h2 class="text-xl font-semibold p-4 bg-indigo-50 border-b">Tabela: ${tabela}</h2>
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>`;

                if (dados && dados.length > 0) {
                    const colunas = Object.keys(dados[0]);
                    for (const coluna of colunas) {
                        html += `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${coluna}</th>`;
                    }
                } else {
                    html += `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sem dados</th>`;
                }

                html += `
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">`;

                if (dados && dados.length > 0) {
                    for (const linha of dados) {
                        html += `<tr>`;
                        for (const coluna of Object.keys(linha)) {
                            let valor = linha[coluna];

                            if (valor instanceof Date) {
                                valor = valor.toLocaleDateString('pt-BR');
                            }
                            else if (valor === null) {
                                valor = '<span class="text-gray-400">NULL</span>';
                            }
                            else if (typeof valor === 'boolean') {
                                valor = valor ? 'Sim' : 'Não';
                            }

                            html += `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${valor}</td>`;
                        }
                        html += `</tr>`;
                    }
                } else {
                    html += `<tr><td colspan="100" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Nenhum registro encontrado</td></tr>`;
                }

                html += `
                                </tbody>
                            </table>
                        </div>`;
            }

            html += `
                    </div>
                </div>
            </body>
            </html>`;

            reply.type('text/html').send(html);
        } catch (err) {
            console.error('Erro na rota /listagem:', err);
            reply.code(500).send(`
                <html>
                <head>
                    <title>Erro</title>
                    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
                </head>
                <body class="bg-gray-100 h-screen flex items-center justify-center">
                    <div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                        <h1 class="text-2xl font-bold text-red-600 mb-4">Erro ao processar a solicitação</h1>
                        <p class="text-gray-600 mb-4">Ocorreu um erro ao processar a sua solicitação.</p>
                        <div class="bg-gray-100 p-4 rounded text-sm text-gray-700 font-mono overflow-auto max-h-40 mb-4">
                            ${err.message}
                        </div>
                        <a href="/" class="block text-center bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Voltar ao Menu</a>
                    </div>
                </body>
                </html>
            `);
        }
    });
}

module.exports = listagemRoutes; 