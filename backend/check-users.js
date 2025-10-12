import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkUsers() {
  let connection;
  
  try {
    console.log('Tentando conectar ao banco de dados...');
    console.log('Configurações:', {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
    });

    console.log('✅ Conexão com o banco estabelecida!');

    // Listar todos os usuários
    const [users] = await connection.execute('SELECT id, name, email, role, company FROM users ORDER BY id');
    
    console.log('\n📋 USUÁRIOS CADASTRADOS:');
    console.log('='.repeat(80));
    
    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado no banco de dados.');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   Nome: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Tipo: ${user.role}`);
        console.log(`   Empresa: ${user.company || 'Não informado'}`);
        console.log('-'.repeat(40));
      });
    }

    // Verificar estrutura da tabela de senhas
    console.log('\n🔐 INFORMAÇÕES SOBRE SENHAS:');
    console.log('='.repeat(80));
    
    const [passwordInfo] = await connection.execute('SELECT id, name, email, password FROM users LIMIT 1');
    if (passwordInfo.length > 0) {
      const user = passwordInfo[0];
      console.log(`Exemplo de senha criptografada para "${user.name}":`);
      console.log(`Hash: ${user.password}`);
      console.log(`Tamanho do hash: ${user.password.length} caracteres`);
      console.log(`Tipo: ${user.password.startsWith('$2') ? 'bcrypt' : 'outro'}`);
    }

  } catch (error) {
    console.error('❌ Erro ao conectar com o banco:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Dicas para resolver:');
      console.log('1. Verifique se o MySQL está rodando');
      console.log('2. Confirme as credenciais no arquivo .env');
      console.log('3. Teste a conexão manualmente');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexão fechada.');
    }
  }
}

checkUsers();

