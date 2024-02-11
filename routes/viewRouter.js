const { Router } = require('express');
const {
  getOverview,
  getTour,
  getLoginForm
} = require('../controllers/viewController');
const { isLoggedIn } = require('../controllers/authController');

const router = Router();

//Protect middleware
router.use(isLoggedIn);

router.get('/', getOverview);
router.get('/tours/:slug', getTour);
router.get('/login', getLoginForm);

module.exports = router;
