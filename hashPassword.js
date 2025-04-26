const bcrypt = require('bcrypt');

const senha = 'sua_senha'; // Substitua 'sua_senha' pela senha desejada

bcrypt.hash(senha, 10, (err, hash) => {
  if (err) throw err;
  console.log(`Senha criptografada: ${hash}`);
});