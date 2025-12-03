const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Virtual relation to ResetToken documents
userSchema.virtual('resetTokens', {
  ref: 'ResetToken',
  localField: '_id',
  foreignField: 'userId',
});

userSchema.methods.verifyPassword = function(password) {
  return bcrypt.compare(password, this.passwordHash);
}

module.exports = mongoose.model('User', userSchema);
