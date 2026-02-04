const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true }, // Roll number
  name: { type: String, required: true },
  branch: String,
  year: String,
  section: String,
  imageUrl: String,
  embedding: { type: [Number], default: [] },
  embeddingFacenet: { type: [Number], default: [] },
  password: { type: String, required: true } // for login
});

//const Student = mongoose.model('Student', studentSchema); // ✅ important line

// Hash password before saving
studentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  });
  
  // Compare password method
  studentSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  const Student = mongoose.model('Student', studentSchema);
module.exports = Student; 
