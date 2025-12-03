const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching', error: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { slug: req.params.slug } });
    if (!project) return res.status(404).json({ message: 'Not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching', error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const { title, slug, description, url } = req.body;
  try {
    const project = await prisma.project.create({ data: { title, slug, description, url } });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Error creating', error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  const update = req.body;
  update.updatedAt = new Date();
  try {
    const project = await prisma.project.update({ where: { id: req.params.id }, data: update });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Error updating', error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting', error: err.message });
  }
});

module.exports = router;
