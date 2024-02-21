const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const { catchAsync } = require('../utils/catchAsync');
const {
  createOne,
  getAll,
  getOne,
  deleteOne,
  updateOne
} = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // get currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          unit_amount: tour.price * 100,
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`]
          }
        },
        quantity: 1
      }
    ]
  });
  // create session as response
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      'script-src https://js.stripe.com; frame-src https://js.stripe.com;'
    )
    .json({
      status: 'success',
      session
    });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // TEMPORARY DUE TO UNSECURE STRIPE CHECKOUT
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) return next();

  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = createOne(Booking);

exports.getAllBookings = getAll(Booking);

exports.getBooking = getOne(Booking);

exports.updateBooking = updateOne(Booking);

exports.deleteBooking = deleteOne(Booking);
