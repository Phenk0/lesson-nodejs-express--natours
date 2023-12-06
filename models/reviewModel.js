const { Schema, model } = require('mongoose');

const reviewModel = new Schema(
  {
    review: {
      type: String,
      trim: true,
      required: [true, 'Review can not be empty.']
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
      type: Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.']
    },
    user: {
      type: Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.']
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

module.exports = model('Review', reviewModel);
