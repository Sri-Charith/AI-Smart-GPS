const mongoose = require('mongoose');

const gatePassRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  reason: { type: String, required: true },
  date: { type: String, },   // format: YYYY-MM-DD
  time: { type: String, },   // format: HH:MM
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Left Campus'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  leftAt: {
    type: Date,
    default: null
  },
  hodMessage: {
    type: String,
    default: ""
  }

});


module.exports = mongoose.model('GatePassRequest', gatePassRequestSchema);
