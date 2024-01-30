const Review = require('../models/reviewModel');
const { catchAsync } = require('../utils/catchAsync');
const { deleteOne, updateOne, createOne } = require('./handlerFactory');
const { createAppError } = require('../utils/appError');
// const { processQuery } = require('../utils/apiFeatures');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  // const reviews = await processQuery(Review, req.query, '-createdAt');
  const reviews = await Review.find(filter);

  res
    .status(200)
    .json({ status: 'success', results: reviews.length, data: { reviews } });
});

exports.setTourUsersIds = (req, res, next) => {
  //allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.createReview = createOne(Review);
exports.updateReview = updateOne(Review);
exports.deleteReview = deleteOne(Review);

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) return next(createAppError('No such tour review to show', 404));

  res.status(200).json({ status: 'success', data: { review } });
});
