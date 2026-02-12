// utils/embeddingUtil.js
const { spawnSync } = require('child_process');
const path = require('path');

const extractEmbedding = (imageUrl) => {
  // The python script is located in python-gps/verify_face_fast.py relative to the project root
  // The backend process is running in the 'backend' folder
  const scriptPath = path.join(__dirname, '..', '..', 'python-gps', 'verify_face_fast.py');

  const result = spawnSync('python', [scriptPath, imageUrl]);
  const output = result.stdout.toString();

  try {
    const parsed = JSON.parse(output);
    return parsed.embedding || null;
  } catch (err) {
    console.error("❌ Failed to parse embedding:", err.message);
    return null;
  }
};

module.exports = { extractEmbedding };
