const sql = require('mssql');
const config = require('./config');

async function connectDB() {
    try {
        const pool = await sql.connect(config);
        console.log('Conexão com o banco de dados estabelecida com sucesso!');
        return pool;
    } catch (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        throw err;
    }
}

async function executeQuery(query, params = []) {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .query(query);
        return result;
    } catch (err) {
        console.error('Erro ao executar query:', err);
        throw err;
    }
}

async function executeQueryWithParams(query, params) {
    try {
        const pool = await sql.connect(config);
        let request = pool.request();

        for (const [key, value] of Object.entries(params)) {
            request = request.input(key, value);
        }

        const result = await request.query(query);
        return result;
    } catch (err) {
        console.error('Erro ao executar query com parâmetros:', err);
        throw err;
    }
}

module.exports = {
    connectDB,
    executeQuery,
    executeQueryWithParams
}; 