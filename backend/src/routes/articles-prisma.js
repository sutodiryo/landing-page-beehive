const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const multer = require('multer');

const prisma = new PrismaClient();
const { generateUniqueSlug } = require('../utils/slugify');

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

// Multer setup for multipart file uploads
const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '';
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// Debug endpoint to list uploaded files (file names + full URLs)
router.get('/uploads/list', async (req, res) => {
  try {
    const uploadsDir = path.resolve(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) return res.json([]);
    const files = fs.readdirSync(uploadsDir).filter(f => !f.startsWith('.'));
    const list = files.map(f => ({ name: f, url: `${req.protocol}://${req.get('host')}/uploads/${f}` }));
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Error listing uploads', error: err.message });
  }
});

const makeFullImageUrl = (req, imgPath) => {
  if (!imgPath) return imgPath;
  if (imgPath.startsWith('http')) return imgPath;
  // ensure we have host info
  const proto = req.protocol;
  const host = req.get('host');
  return `${proto}://${host}${imgPath}`;
}

router.get('/', async (req, res) => {
  try {
    const articles = await prisma.article.findMany({ orderBy: { createdAt: 'desc' } });
    const mapped = articles.map(a => ({ ...a, image: a.image ? makeFullImageUrl(req, a.image) : a.image }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching', error: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const article = await prisma.article.findUnique({ where: { slug: req.params.slug } });
    if (!article) return res.status(404).json({ message: 'Not found' });
    article.image = article.image ? makeFullImageUrl(req, article.image) : article.image;
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching', error: err.message });
  }
});

router.post('/', auth, upload.single('image'), async (req, res) => {
  const { title, slug, content, author } = req.body;
  try {
    let imagePath = undefined;
    // prefer multipart file upload
    if (req.file && req.file.filename) {
      imagePath = `/uploads/${req.file.filename}`;
      console.log('Received multipart file, saved to', req.file.path);
    } else if (req.body.image && typeof req.body.image === 'string') {
      // fallback to base64 payload
      if (req.body.image.startsWith('data:')) {
        imagePath = await saveBase64Image(req.body.image);
        console.log('Saved new image from base64 to', imagePath);
      } else {
        imagePath = req.body.image; // assume already a URL/path
      }
    }
    // generate slug if not provided
    let finalSlug = slug;
    if (!finalSlug) finalSlug = await generateUniqueSlug(prisma, 'article', title || slug || Date.now().toString());
    const article = await prisma.article.create({ data: { title, slug: finalSlug, content, author, image: imagePath } });
    article.image = article.image ? makeFullImageUrl(req, article.image) : article.image;
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: 'Error creating', error: err.message });
  }
});

router.put('/:id', auth, upload.single('image'), async (req, res) => {
  const update = { ...req.body };
  update.updatedAt = new Date();
  try {
    // if multipart file provided, use it
    if (req.file && req.file.filename) {
      update.image = `/uploads/${req.file.filename}`;
      console.log('Received multipart file for update, saved to', req.file.path);
    } else if (Object.prototype.hasOwnProperty.call(update, 'image')) {
      console.log('PUT /api/articles/:id image present (body):', !!update.image);
      if (!update.image) {
        update.image = null;
      } else if (typeof update.image === 'string' && update.image.startsWith('data:')) {
        const saved = await saveBase64Image(update.image);
        if (saved) {
          update.image = saved;
          console.log('Saved updated image to', saved);
        }
      }
    }
    // if title changed and slug not provided, regenerate slug
    if (!update.slug && update.title) {
      update.slug = await generateUniqueSlug(prisma, 'article', update.title);
    }
    const article = await prisma.article.update({ where: { id: req.params.id }, data: update });
    article.image = article.image ? makeFullImageUrl(req, article.image) : article.image;
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
