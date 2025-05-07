const fastify = require('fastify')({ logger: true });
const path = require('path');
const helloRoutes = require('./routes/hello');

fastify.register(helloRoutes);

fastify.get('/', async (request, reply) => {
    return { message: 'API de Vinhos está funcionando! Acesse /hello para ver a página HTML.' };
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