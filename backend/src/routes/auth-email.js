const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');
const { passwordMeetsRules } = require('../utils/validators');
const { sendPasswordResetEmail } = require('../utils/email');

const prisma = new PrismaClient();
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
const resetExpiresMin = parseInt(process.env.RESET_TOKEN_EXPIRES_MIN || '30');

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'username and password required' });
  if (!passwordMeetsRules(password)) return res.status(400).json({ message: 'Password does not meet requirements' });
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    await prisma.user.create({ data: { username, passwordHash: hash } });
    res.json({ message: 'User created' });
  } catch (err) {
    console.error(err);
    console.log(err);
    res.status(500).json({ message: 'Error creating user', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

router.post('/reset-request', async (req, res) => {
  const { username, email } = req.body;
  if (!username) return res.status(400).json({ message: 'username required' });
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(200).json({ message: 'If user exists, reset email will be sent' });
    }
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + resetExpiresMin * 60 * 1000);
    await prisma.resetToken.create({ data: { userId: user.id, token, expiresAt } });
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/reset?token=${token}`;
    const emailSent = await sendPasswordResetEmail(email || username, token, resetLink);
    console.log('Password reset token for', username, ':', token);

    // In development when SMTP is not configured, return the token in the response
    // so frontend can display it. Do NOT expose tokens in production environments.
    if (!emailSent || !process.env.SMTP_HOST) {
      return res.json({ message: 'SMTP not configured - token generated (returned for dev).', token });
    }

    res.json({ message: 'If SMTP is configured, reset email sent.' });
  } catch (err) {
    console.error('Error requesting reset:', err);
    res.status(500).json({ message: 'Error requesting reset', error: err.message });
  }
});

router.post('/reset', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ message: 'token and newPassword required' });
  if (!passwordMeetsRules(newPassword)) return res.status(400).json({ message: 'Password does not meet requirements' });
  try {
    const reset = await prisma.resetToken.findUnique({ where: { token } });
    if (!reset) return res.status(400).json({ message: 'Invalid or expired token' });
    if (reset.expiresAt < new Date()) return res.status(400).json({ message: 'Token expired' });
    const hash = await bcrypt.hash(newPassword, saltRounds);
    await prisma.user.update({ where: { id: reset.userId }, data: { passwordHash: hash } });
    await prisma.resetToken.delete({ where: { id: reset.id } });
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error resetting password', error: err.message });
  }
});

module.exports = router;
