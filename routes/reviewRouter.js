const { Router } = require('express');
const {
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
  getReview,
  setTourUsersIds
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

const router = Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), setTourUsersIds, createReview);
router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('user', 'admin'), deleteReview);

module.exports = router;
