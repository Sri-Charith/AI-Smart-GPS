const GatePassRequest = require('../models/GatePassRequest');
const Student = require('../models/Student');
require('dotenv').config();

const twilio = require('twilio');
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send gate pass request
exports.sendGatePassRequest = async (req, res) => {
  try {
    const { reason, date, time } = req.body;
    const studentId = req.student.id;

    const existingRequest = await GatePassRequest.findOne({ student: studentId, status: 'Pending' });
    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending request.' });
    }

    const request = new GatePassRequest({
      student: studentId,
      reason,
      date,
      time,
    });

    await request.save();
    const student = await Student.findById(studentId);

    try {
      await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_FROM,
        to: process.env.HOD_WHATSAPP_TO,
        body: `📢 New Gatepass Request\nStudent: ${student.name}\nID: ${student.studentId}\nDate: ${date}\nTime: ${time}\nReason: ${reason}`
      });

      await client.messages.create({
        from: process.env.TWILIO_SMS_FROM,
        to: process.env.HOD_SMS_TO,
        body: `New Gatepass from ${student.name} (${student.studentId}) at ${time} on ${date}`
      });

    } catch (twilioErr) {
      console.error("📵 Twilio Error:", twilioErr.message);
    }

    res.status(201).json({ message: 'Gate pass request sent successfully', request });
  } catch (error) {
    res.status(500).json({ message: 'Error sending request', error: error.message });
  }
};

// View student request status
exports.viewStatus = async (req, res) => {
  try {
    if (!req.student || !req.student.id) {
      return res.status(401).json({ message: 'Unauthorized: Student context missing' });
    }
    const studentId = req.student.id;
    const requests = await GatePassRequest.find({ student: studentId })
      .populate('student', 'studentId name branch year section imageUrl')
      .sort({ createdAt: -1 });
    res.status(200).json({ requests });
  } catch (error) {
    console.error("🔥 GatePass Status View Error:", error.message);
    res.status(500).json({ message: 'Error fetching request status', error: error.message });
  }
};

// Delete student's request
exports.deleteRequest = async (req, res) => {
  try {
    const studentId = req.student.id;
    const requestId = req.params.id;

    const request = await GatePassRequest.findOne({ _id: requestId, student: studentId });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    await GatePassRequest.findByIdAndDelete(requestId);
    res.status(200).json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting request', error: error.message });
  }
};

