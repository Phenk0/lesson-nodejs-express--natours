const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const { catchAsync } = require('../utils/catchAsync');
const { createAppError } = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  //1 Get tour data from collection
  const tours = await Tour.find();
  //2 Build template

  //3 Render that template using the data from step 1
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' ws://127.0.0.1:*;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com 'self' ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('overview', {
      title: 'All Tours',
      tours
    });
});
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review rating user'
  });

  if (!tour) {
    return next(createAppError('There is no tour with that name', 404));
  }

  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com https://js.stripe.com ws://127.0.0.1:*;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: https://js.stripe.com ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('tour', {
      title: `${tour.name} Tour`,
      tour
    });
});

exports.getLoginForm = (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('login', { title: 'Log into your account' });
};

exports.getAccount = (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' ws://127.0.0.1:*;base-uri 'self';block-all-mixed-content;"
    )
    .render('account', { title: 'Your account' });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const myTours = await Booking.find({ user: req.user.id });
  // 2) Find tours with the returned IDs
  const tourIds = myTours.map((booking) => booking.tour);
  // _id: { $in: tourIds } is finding all tours with an ID that is in tourIds array
  const tours = await Tour.find({ _id: { $in: tourIds } });

  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' ws://127.0.0.1:*;base-uri 'self';block-all-mixed-content;"
    )
    .render('overview', { title: 'My Tours', tours });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );
  res
    .status(200)
    .render('account', { title: 'Your account', user: updatedUser });
});
