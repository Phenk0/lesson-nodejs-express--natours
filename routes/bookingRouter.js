const { Router } = require('express');
const { getCheckoutSession } = require('../controllers/bookingController');
const { protect } = require('../controllers/authController');

const router = Router();

router.post('/checkout-session/:tourId', protect, getCheckoutSession);

module.exports = router;
