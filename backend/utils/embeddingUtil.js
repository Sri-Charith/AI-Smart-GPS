// utils/embeddingUtil.js
const { spawnSync } = require('child_process');

const extractEmbedding = (imageUrl) => {
  const result = spawnSync('python', ['face-verification/verify_face_fast.py', imageUrl]);
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
