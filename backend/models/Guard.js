const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const guardSchema = new mongoose.Schema({
  guardId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true }
});

// Hash password before saving
guardSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
guardSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Guard', guardSchema);
