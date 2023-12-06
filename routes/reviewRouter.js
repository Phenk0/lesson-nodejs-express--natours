const { Router } = require('express');
const {
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
  getReview
} = require('../controllers/reviewController');

const router = Router();

router.route('/').get(getAllReviews).post(createReview);
router.route('/:id').get(getReview).patch(updateReview).delete(deleteReview);

module.exports = router;
