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

async function executeQuery(query) {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(query);
        return result;
    } catch (err) {
        console.error('Erro ao executar query:', err);
        throw err;
    }
}

module.exports = {
    connectDB,
    executeQuery
}; 