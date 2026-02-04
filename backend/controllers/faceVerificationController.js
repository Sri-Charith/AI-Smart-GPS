const { spawnSync } = require('child_process');
const Student = require('../models/Student');
const GatePassRequest = require('../models/GatePassRequest');

function getTodayInIST() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffset);
  return istNow.toISOString().split('T')[0];  // "YYYY-MM-DD"
}

// Cosine similarity function
function cosineSimilarity(vec1, vec2) {
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const normA = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (normA * normB);
}

// Threshold (for VGG-Face with cosine similarity)
const SIMILARITY_THRESHOLD = 0.4;

exports.verifyFace = async (req, res) => {
  const { scannedImageUrl } = req.body;

  try {
    const todayIST = getTodayInIST();
    // 1. Get embedding of scanned image using Python
    const result = spawnSync('python', ['face-verification/verify_face_fast.py', scannedImageUrl]);
    const output = result.stdout.toString();
    const parsed = JSON.parse(output);

    if (!parsed.embedding) {
      return res.status(400).json({ message: 'Failed to extract face embedding', error: parsed.error });
    }

    const scannedEmbedding = parsed.embedding;

    // 2. Get approved students with embeddings
    const approvedRequests = await GatePassRequest.find({
      status: 'Approved',
      leftAt: null,
      date: todayIST
    }).populate('student');

    let bestMatch = null;
    let bestSimilarity = 0;
    let bestConfidence = 1;
    let matchedRequest = null;

    for (const request of approvedRequests) {
      const student = request.student;
      if (!student || !student.embedding) continue;

      const similarity = cosineSimilarity(scannedEmbedding, student.embedding);
      const confidence = (1 - similarity).toFixed(4);

      console.log(`🧪 Comparing with ${student.name} => similarity: ${similarity}, confidence: ${confidence}`);

      if (similarity >= SIMILARITY_THRESHOLD && similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = student;
        bestConfidence = confidence;
        matchedRequest = request;
      }
    }

    if (!bestMatch) {
      return res.status(401).json({ message: '❌ No matching approved student found - access denied' });
    }

    return res.status(200).json({
      message: '✅ Face verified - student allowed',
      studentId: bestMatch.studentId,
      name: bestMatch.name,
      imageUrl: bestMatch.imageUrl,
      year: bestMatch.year,
      branch: bestMatch.branch,
      section: bestMatch.section,
      reason: matchedRequest.reason,
      time: matchedRequest.time,
      similarity: bestSimilarity.toFixed(4),
      confidence: bestConfidence,
      status: matchedRequest.status
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
