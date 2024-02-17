const { Router } = require('express');
const {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  updateUserData
} = require('../controllers/viewController');
const { isLoggedIn, protect } = require('../controllers/authController');

const router = Router();

//Protect middleware
// router.use(isLoggedIn);

router.get('/', isLoggedIn, getOverview);
router.get('/tours/:slug', isLoggedIn, getTour);
router.get('/login', isLoggedIn, getLoginForm);
router.get('/me', protect, getAccount);

// router.post('/submit-user-data', protect, updateUserData);

module.exports = router;
