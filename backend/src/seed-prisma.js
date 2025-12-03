require('dotenv').config();
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const main = async () => {
  const username = 'admin';
  const password = 'Admin@123456';
  const salt = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
  const hash = await bcrypt.hash(password, salt);
  try {
    const user = await prisma.user.create({ data: { username, passwordHash: hash } });
    console.log('Admin user created:', username);
  } catch (err) {
    console.log('User may already exist or error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
