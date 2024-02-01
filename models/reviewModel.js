const mongoose = require('mongoose');

const reviewModel = new mongoose.Schema(
  {
    review: {
      type: String,
      trim: true,
      required: [true, 'Review can not be empty.'],
      maxLength: [200, 'A review must have less or equal then 150 characters'],
      minLength: [5, 'A review must have more or equal then 5 characters']
    },
    rating: {
      type: Number,
      min: [1, 'Minimum rating is 1'],
      max: [5, 'Maximum rating is 5'],
      default: 4,
      required: [true, 'Review must have your rating.']
    },
    createdAt: { type: Date, default: Date.now() },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.']
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

reviewModel.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name photo' });
  next();
});

module.exports = mongoose.model('Review', reviewModel);
