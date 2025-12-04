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
// allow larger JSON bodies for base64 image uploads
app.use(express.json({ limit: '10mb' }));
const path = require('path');
// Serve uploads with CORS headers so images can be fetched from the frontend
const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/uploads', (req, res, next) => {
  const allowOrigin = process.env.ALLOW_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}, express.static(uploadsPath, {
  setHeaders: (res) => {
    const allowOrigin = process.env.ALLOW_ORIGIN || '*';
    res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  }
}));

// ensure uploads dir exists and log its location
const fs = require('fs');
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory at', uploadsDir);
  } catch (err) {
    console.error('Failed to create uploads directory', err.message);
  }
} else {
  console.log('Uploads directory exists at', uploadsDir);
}

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
