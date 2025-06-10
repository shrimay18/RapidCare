const Record = require('../models/Record');

class RecordController {
  // Get all records for a patient
  async getAllRecords(req, res) {
    try {
      const userId = req.user.id;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
      }
      const records = await Record.find({ userId });
      const mappedRecords = records.map(r => ({ ...r.toObject(), id: r._id }));
      res.json({ success: true, records: mappedRecords });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }

  // Add a new record for a patient
  async addRecord(req, res) {
    try {
      const userId = req.user.id;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
      }
      const newRecord = new Record({ ...req.body, userId });
      await newRecord.save();
      res.json({ success: true, record: { ...newRecord.toObject(), id: newRecord._id } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }
}

module.exports = new RecordController();