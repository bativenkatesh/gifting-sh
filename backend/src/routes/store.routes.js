const express = require('express');
const { getPublicStoreSettings } = require('../controllers/store.controller');

const router = express.Router();
router.get('/store-settings', getPublicStoreSettings);

module.exports = router;
