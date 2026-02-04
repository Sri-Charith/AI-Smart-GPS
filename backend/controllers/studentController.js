const fs = require('fs');
const csv = require('csv-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const { spawnSync } = require('child_process');

const uploadStudents = async (req, res) => {
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        for (const student of results) {
          // Run the Python embedding script
          const process = spawnSync('python', [
            'face-verification/extract_embedding_single.py',
            student.imageUrl
          ]);

          const output = process.stdout.toString();
          const parsed = JSON.parse(output);

          if (parsed.embedding) {
            const newStudent = new Student({
              ...student,
              embedding: parsed.embedding
            });
            await newStudent.save();
          } else {
            console.log(`❌ Skipping ${student.name}: No embedding`);
          }
        }

        res.status(200).json({ message: 'Students uploaded and embeddings stored!' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Upload failed', details: error.message });
      }
    });
};


const loginStudent = async (req, res) => {
  const { studentId, password } = req.body;

  try {
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(401).json({ error: 'Invalid student ID or password' });
    }

    const isMatch = await student.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid student ID or password' });
    }

    const token = jwt.sign(
      { studentId: student.studentId, id: student._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      student: {
        id: student._id,
        studentId: student.studentId,
        name: student.name,
        branch: student.branch,
        year: student.year,
        section: student.section,
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};

const getDashboard = async (req, res) => {
  try {
    const student = await Student.findById(req.student.id).select('-password');
    res.json({ student });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard', error: error.message });
  }
};

module.exports = { uploadStudents, loginStudent, getDashboard };


