const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const recordController = require('../controllers/recordController');

router.get('/', auth, recordController.getAllRecords);
router.post('/', auth, recordController.addRecord);

module.exports = router;