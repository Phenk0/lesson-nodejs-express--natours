const { Router } = require('express');
const {
  getAllReviews,
  createReview
  /*  updateReview,
  deleteReview,
  getReview*/
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

const router = Router();

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), createReview);
/*router
  .route('/:id')
  .get(getReview)
  .patch(protect, updateReview)
  .delete(protect, deleteReview);*/

module.exports = router;
