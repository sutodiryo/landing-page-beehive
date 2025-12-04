function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function generateUniqueSlug(prisma, modelName, titleOrSlug) {
  const base = slugify(titleOrSlug) || `item`;
  let slug = base;
  let i = 1;
  // prisma[modelName] should exist (e.g., prisma.article)
  while (true) {
    try {
      const existing = await prisma[modelName].findUnique({ where: { slug } });
      if (!existing) return slug;
      slug = `${base}-${i++}`;
    } catch (err) {
      // If there's any error (model not found), just return base
      return base;
    }
  }
}

module.exports = { slugify, generateUniqueSlug };
