const fastify = require('fastify')({ logger: true });
const path = require('path');
const listagemRoutes = require('./routes/listagem');

fastify.register(listagemRoutes);

fastify.get('/', async (request, reply) => {
    const html = `
    <!DOCTYPE html>
    <html lang="pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sistema de Gestão de Vinhos</title>
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    </head>
    <body class="bg-gray-100">
        <div class="container mx-auto px-4 py-8">
            <h1 class="text-4xl font-bold mb-8 text-gray-800">Sistema de Gestão de Vinhos</h1>
            
            <div class="grid grid-cols-1 md:grid-cols-1 gap-6">
                <a href="/listagem" class="block">
                    <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                        <h2 class="text-xl font-semibold mb-4 text-indigo-600">Listagem de Dados</h2>
                        <p class="text-gray-600">Visualize dados de todas as tabelas</p>
                    </div>
                </a>
            </div>
        </div>
    </body>
    </html>
    `;
    reply.type('text/html').send(html);
});

const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        console.log(`Servidor rodando em ${fastify.server.address().port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start(); 