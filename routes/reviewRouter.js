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

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), setTourUsersIds, createReview);
router
  .route('/:id')
  .get(getReview)
  .patch(protect, updateReview)
  .delete(protect, restrictTo('admin'), deleteReview);

module.exports = router;
