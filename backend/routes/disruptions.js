const express = require('express');
const {
  getScenarioCatalog,
  getDisruptions,
  createDisruption,
} = require('../controllers/disruptionsController');

const router = express.Router();

router.get('/scenarios', getScenarioCatalog);
router.get('/', getDisruptions);
router.post('/', createDisruption);

module.exports = router;
