const bcrypt = require('bcryptjs');

const passwords = [
  'T@dA2024!Thy#',
  'T@dA2024!Lar#',
  'T@dA2024!Mar#'
];

passwords.forEach(async (pw) => {
  const hash = await bcrypt.hash(pw, 10);
  console.log(`${pw}: ${hash}`);
}); 