const GatePassRequest = require('../models/GatePassRequest');
const Student = require('../models/Student');
const Department = require('../models/Department');
const { spawnSync } = require('child_process');

// Get department profile
const getDepartmentProfile = async (req, res) => {
  try {
    const department = await Department.findById(req.department.id).select('-password');
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.status(200).json({ department });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
};

// Get all gate pass requests with student details (Filtered by HOD Department)
const getAllRequests = async (req, res) => {
  try {
    // 1. Get the current HOD's department
    const hod = await Department.findById(req.department.id);
    if (!hod || !hod.department) {
      return res.status(404).json({ message: 'HOD Department not configured' });
    }

    // 2. Find all students belonging to this department (branch)
    // Note: In student model it's 'branch', in HOD model it's 'department'
    const studentsInDept = await Student.find({ branch: hod.department }).select('_id');
    const studentIds = studentsInDept.map(s => s._id);

    // 3. Find requests only for these students
    const requests = await GatePassRequest.find({ student: { $in: studentIds } })
      .populate('student', 'studentId name branch year section imageUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (error) {
    console.error("🔥 Error fetching department-specific requests:", error.message);
    res.status(500).json({ message: 'Error fetching requests', error: error.message });
  }
};

// Approve a request
const approveRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { message } = req.body;
    const request = await GatePassRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = 'Approved';
    if (message) request.hodMessage = message;
    await request.save();

    res.status(200).json({ message: 'Request approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error approving request', error: error.message });
  }
};


// Reject a request
const rejectRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { message } = req.body;
    const request = await GatePassRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = 'Rejected';
    if (message) request.hodMessage = message;
    await request.save();

    res.status(200).json({ message: 'Request rejected successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting request', error: error.message });
  }
};


function cosineSimilarity(vec1, vec2) {
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const normA = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (normA * normB);
}

const SIMILARITY_THRESHOLD = 0.38;
const scanFaceAndGetStudentHistory = async (req, res) => {
  const { scannedImageUrl } = req.body;

  try {
    const result = spawnSync('python', ['face-verification/verify_face_fast.py', scannedImageUrl]);
    const output = result.stdout.toString();
    const parsed = JSON.parse(output);

    if (!parsed.embedding) {
      return res.status(400).json({ message: 'Failed to extract face embedding', error: parsed.error });
    }

    const scannedEmbedding = parsed.embedding;
    const students = await Student.find({ embedding: { $exists: true } });

    let bestMatch = null;
    let bestSimilarity = 0;
    let bestConfidence = 1;

    console.log(`🔍 Scanning ${students.length} students...`);

    for (const student of students) {
      const similarity = cosineSimilarity(scannedEmbedding, student.embedding);
      const confidence = (1 - similarity).toFixed(4);

      if (similarity >= SIMILARITY_THRESHOLD && similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = student;
        bestConfidence = confidence;
      }
    }

    if (!bestMatch) {
      return res.status(401).json({ message: '❌ No matching student found' });
    }

    const history = await GatePassRequest.find({ student: bestMatch._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: '✅ Student matched',
      match: {
        studentId: bestMatch.studentId,
        name: bestMatch.name,
        branch: bestMatch.branch,
        year: bestMatch.year,
        section: bestMatch.section,
        imageUrl: bestMatch.imageUrl,
        similarity: bestSimilarity.toFixed(4),
        confidence: bestConfidence
      },
      history
    });

  } catch (err) {
    console.error('❌ DEPT SCAN ERROR:', err.message);
    return res.status(500).json({ message: 'Server error during face scan', error: err.message });
  }
};

module.exports = {
  getAllRequests,
  approveRequest,
  rejectRequest,
  getDepartmentProfile,
  scanFaceAndGetStudentHistory,
};

