const Guard = require('../models/Guard');
const GatePassRequest = require('../models/GatePassRequest');

// ✅ Helper: Get current IST datetime
function getISTNow() {
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
  const hour = findPart('hour');
  const minute = findPart('minute');
  const second = findPart('second');

  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
}

// ✅ Main handler: Fetch today's requests between 9:30 AM and 5:30 PM IST
exports.getAllRequestsForGuard = async (req, res) => {
  try {
    const nowIST = getISTNow();

    const startIST = new Date(nowIST);
    startIST.setHours(9, 30, 0, 0);

    const endIST = new Date(nowIST);
    endIST.setHours(17, 30, 0, 0);

    console.log("⏰ IST Now      :", nowIST.toLocaleString('en-IN'));
    console.log("🕘 Start Bound :", startIST.toLocaleString('en-IN'));
    console.log("🕔 End Bound   :", endIST.toLocaleString('en-IN'));

    if (nowIST < startIST || nowIST > endIST) {
      console.log("⛔ Outside 9:30–5:30 IST, returning empty list");
      return res.status(200).json({ requests: [] });
    }

    const todayStr = nowIST.toISOString().split('T')[0]; // "YYYY-MM-DD"

    const requests = await GatePassRequest.find({
      status: 'Approved',
      leftAt: null,
      date: todayStr
    })
      .populate('student', 'studentId name branch year section imageUrl')
      .sort({ createdAt: -1 });

    console.log("✅ Requests fetched:", requests.length);
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
