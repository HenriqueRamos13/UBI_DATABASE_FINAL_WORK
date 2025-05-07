const path = require('path');
const fs = require('fs').promises;
const { executeQuery } = require('../db');

async function helloRoutes(fastify) {
    fastify.get('/hello', async (request, reply) => {
        try {
            const result = await executeQuery('SELECT TOP 5 * FROM regiao');

            console.log('Dados da tabela regiao:');
            console.log(result.recordset);

            const htmlPath = path.join(__dirname, '../views/hello.html');
            const content = await fs.readFile(htmlPath, 'utf8');

            reply.type('text/html').send(content);
        } catch (err) {
            console.error('Erro na rota /hello:', err);
            reply.code(500).send('Erro ao processar a solicitação');
        }
    });
}

module.exports = helloRoutes; 