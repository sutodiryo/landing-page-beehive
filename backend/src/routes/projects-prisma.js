const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const prisma = new PrismaClient();

// helper to save base64 images (fallback)
const saveBase64Image = async (dataUrl) => {
  try {
    const matches = dataUrl.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
    if (!matches) return null;
    const mime = matches[1];
    const ext = mime.split('/')[1] || 'jpg';
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');
    const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
    const filepath = path.resolve(uploadsDir, filename);
    fs.writeFileSync(filepath, buffer);
    console.log('saveBase64Image wrote file to', filepath);
    return `/uploads/${filename}`;
  } catch (err) {
    console.error('Failed to save image', err.message);
    return null;
  }
}

// multer setup
const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadsDir); },
  filename: function (req, file, cb) { const ext = path.extname(file.originalname) || ''; cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`); }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const makeFullImageUrl = (req, imgPath) => {
  if (!imgPath) return imgPath;
  if (imgPath.startsWith('http')) return imgPath;
  const proto = req.protocol;
  const host = req.get('host');
  return `${proto}://${host}${imgPath}`;
}

router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
    const mapped = projects.map(p => ({ ...p, image: p.image ? makeFullImageUrl(req, p.image) : p.image }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching', error: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { slug: req.params.slug } });
    if (!project) return res.status(404).json({ message: 'Not found' });
    project.image = project.image ? makeFullImageUrl(req, project.image) : project.image;
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching', error: err.message });
  }
});

// debug uploads list
router.get('/uploads/list', async (req, res) => {
  try {
    const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) return res.json([]);
    const files = fs.readdirSync(uploadsDir).filter(f => !f.startsWith('.'));
    const list = files.map(f => ({ name: f, url: `${req.protocol}://${req.get('host')}/uploads/${f}` }));
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Error listing uploads', error: err.message });
  }
});

router.post('/', auth, upload.single('image'), async (req, res) => {
  const { title, slug, description, url } = req.body;
  try {
    let imagePath = undefined;
    if (req.file && req.file.filename) {
      imagePath = `/uploads/${req.file.filename}`;
      console.log('Received project multipart file, saved to', req.file.path);
    } else if (req.body.image && typeof req.body.image === 'string') {
      if (req.body.image.startsWith('data:')) {
        imagePath = await saveBase64Image(req.body.image);
        console.log('Saved project image from base64 to', imagePath);
      } else {
        imagePath = req.body.image;
      }
    }
    const project = await prisma.project.create({ data: { title, slug, description, url, image: imagePath } });
    project.image = project.image ? makeFullImageUrl(req, project.image) : project.image;
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Error creating', error: err.message });
  }
});

router.put('/:id', auth, upload.single('image'), async (req, res) => {
  const update = { ...req.body };
  update.updatedAt = new Date();
  try {
    if (req.file && req.file.filename) {
      update.image = `/uploads/${req.file.filename}`;
      console.log('Received project update multipart file, saved to', req.file.path);
    } else if (Object.prototype.hasOwnProperty.call(update, 'image')) {
      if (!update.image) update.image = null;
      else if (typeof update.image === 'string' && update.image.startsWith('data:')) {
        const saved = await saveBase64Image(update.image);
        if (saved) update.image = saved;
      }
    }
    const project = await prisma.project.update({ where: { id: req.params.id }, data: update });
    project.image = project.image ? makeFullImageUrl(req, project.image) : project.image;
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Error updating', error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    // find project to get image path
    const proj = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!proj) return res.status(404).json({ message: 'Not found' });
    // delete DB record
    await prisma.project.delete({ where: { id: req.params.id } });
    // if there was an uploaded image stored under /uploads, unlink the file
    if (proj.image && typeof proj.image === 'string' && proj.image.startsWith('/uploads/')) {
      try {
        const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads');
        const filename = proj.image.replace('/uploads/', '');
        const filepath = path.join(uploadsDir, filename);
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
          console.log('Deleted uploaded file', filepath);
        }
      } catch (e) {
        console.warn('Failed to unlink uploaded image for project', req.params.id, e.message);
      }
    }
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting', error: err.message });
  }
});

module.exports = router;
