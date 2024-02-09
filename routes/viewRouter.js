const { Router } = require('express');
const { getOverview, getTour } = require('../controllers/viewController');

const router = Router();

router.get('/', getOverview);
router.get('/tours/:slug', getTour);

module.exports = router;
