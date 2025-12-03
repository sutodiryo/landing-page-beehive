require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { initializeEmailTransport } = require('./utils/email');

const authRoutes = require('./routes/auth-email');
const articleRoutes = require('./routes/articles-prisma');
const projectRoutes = require('./routes/projects-prisma');

const prisma = new PrismaClient();
const app = express();

// Initialize email transport
initializeEmailTransport();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/projects', projectRoutes);

app.get('/', (req, res) => res.json({message: 'Company backend running with Prisma'}));

const PORT = process.env.PORT || 4000;

const connectPrismaWithRetry = async (retries = 10, delayMs = 3000) => {
  while (retries > 0) {
    try {
      await prisma.$connect();
      return true;
    } catch (err) {
      console.warn('Prisma $connect failed, retries left:', retries - 1, '-', err.message);
      retries -= 1;
      if (retries <= 0) {
        return false;
      }
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  return false;
};

app.listen(PORT, async () => {
  const ok = await connectPrismaWithRetry(12, 3000);
  if (!ok) {
    console.error('Database connection failed after retries; exiting');
    process.exit(1);
  }
  console.log('Connected to database via Prisma');
  console.log('Server running on port', PORT);
  if (process.env.SMTP_HOST) {
    console.log('Email sending configured');
  } else {
    console.log('Email sending not configured - tokens will only be logged');
  }
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
