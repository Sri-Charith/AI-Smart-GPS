const Guard = require('../models/Guard');
const GatePassRequest = require('../models/GatePassRequest');

// ✅ Helper: Get current IST date parts
function getISTDateInfo() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const parts = formatter.formatToParts(now);
  const findPart = (type) => parts.find(p => p.type === type).value;

  const year = findPart('year');
  const month = findPart('month');
  const day = findPart('day');

  return {
    todayStr: `${year}-${month}-${day}`, // "YYYY-MM-DD"
    fullIST: `${day}/${month}/${year} ${findPart('hour')}:${findPart('minute')}`
  };
}

// ✅ Main handler: Fetch all approved requests
exports.getAllRequestsForGuard = async (req, res) => {
  try {
    const { filter } = req.query;
    const isHistory = filter === 'checked';
    const { fullIST } = getISTDateInfo();

    console.log(`📡 Fetching Requests (IST: ${fullIST}, Tab: ${filter})`);

    const query = isHistory
      ? { status: 'Left Campus' }
      : { status: 'Approved', leftAt: null };

    const requests = await GatePassRequest.find(query)
      .populate('student', 'studentId name branch year section imageUrl')
      .sort({ updatedAt: -1 });

    console.log(`✅ ${isHistory ? 'HISTORY' : 'ACTIVE'} FETCHED:`, requests.length);
    res.status(200).json({ requests });
  } catch (error) {
    console.error('❌ Error in getAllRequestsForGuard:', error.message);
    res.status(500).json({ message: 'Error fetching requests for guard', error: error.message });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await GatePassRequest.findByIdAndDelete(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.status(200).json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting request', error: error.message });
  }
};

exports.getGuardProfile = async (req, res) => {
  try {
    const guard = await Guard.findById(req.guard.id).select('-password');
    if (!guard) return res.status(404).json({ message: 'Guard not found' });
    res.status(200).json({ guard });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching guard profile', error: err.message });
  }
};

exports.markAsLeft = async (req, res) => {
  try {
    const requestId = req.params.id;

    const request = await GatePassRequest.findById(requestId).populate('student');
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.status !== 'Approved') {
      return res.status(400).json({ message: 'Only approved requests can be marked as left' });
    }

    request.status = 'Left Campus';
    request.leftAt = new Date();

    await request.save();

    res.status(200).json({
      message: `✅ Marked as Left Campus at ${request.leftAt.toLocaleString()}`,
      request
    });
  } catch (error) {
    res.status(500).json({ message: 'Error marking as left', error: error.message });
  }
};
