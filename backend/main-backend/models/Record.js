const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, 
    required: true
  },
  doctor: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  diagnosis: {
    type: String,
    required: true
  },
  prescription: {
    type: String,
    required: false
  },
  notes: {
    type: String,
    required: false
  },
  cost: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Record', recordSchema);