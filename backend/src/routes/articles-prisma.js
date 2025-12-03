const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const articles = await prisma.article.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching', error: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const article = await prisma.article.findUnique({ where: { slug: req.params.slug } });
    if (!article) return res.status(404).json({ message: 'Not found' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching', error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const { title, slug, content, author } = req.body;
  try {
    const article = await prisma.article.create({ data: { title, slug, content, author } });
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: 'Error creating', error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  const update = req.body;
  update.updatedAt = new Date();
  try {
    const article = await prisma.article.update({ where: { id: req.params.id }, data: update });
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: 'Error updating', error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.article.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting', error: err.message });
  }
});

module.exports = router;
