const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');
const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gatepass_students', // folder in your Cloudinary account
    allowed_formats: ['jpg', 'jpeg', 'png']
  }
});

const upload = multer({ storage: storage });

// POST /api/upload/photo
router.post('/photo', upload.single('image'), (req, res) => {
  try {
    res.status(200).json({ imageUrl: req.file.path });
  } catch (err) {
    res.status(500).json({ error: 'Image upload failed' });
  }
});

module.exports = router;
