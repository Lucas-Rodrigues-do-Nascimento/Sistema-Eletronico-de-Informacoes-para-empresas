const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost', // Endereço do seu servidor MySQL, geralmente 'localhost'
  user: 'root', // Seu usuário do MySQL
  password: 'senhadolucas', // Sua senha do MySQL
  database: 'correa_materiais_eletricos' // Nome do banco de dados que você criou
});

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conexão com o banco de dados estabelecida com sucesso.');
});

module.exports = connection;