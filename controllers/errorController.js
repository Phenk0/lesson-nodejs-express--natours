const { createAppError } = require('../utils/appError');

exports.globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    // API
    if (req.originalUrl.startsWith('/api')) {
      //give rich info
      res.status(err.statusCode).json({
        error: err,
        status: err.status,
        message: err.message,
        stack: err.stack
      });
    } else {
      // RENDERED WEBSITE
      res.status(err.statusCode).render('error', {
        title: 'Something go wrong',
        msg: err.message
      });
    }
  } else if (process.env.NODE_ENV === 'production' && err.isOperational) {
    //give predicted(operational) error info
    if (req.originalUrl.startsWith('/api')) {
      // API
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      // RENDERED WEBSITE
      res.status(err.statusCode).render('error', {
        title: 'Something go wrong',
        msg: err.message
      });
    }
  } else if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    // Unhandled error that can leak unexpected details +marker for programmer
    let error = { ...err };

    //error handling for wrong id
    if (err.name === 'CastError')
      error = createAppError(`Invalid ${err.path}: ${err.value}`, 404);
    //error handling for duplicate unique key while creating item
    if (err.code === 11000)
      error = createAppError(
        `Duplicate field value entered: ${JSON.stringify(
          err.keyValue
        )}. Please use another value`,
        400
      );

    //error handling for invalid key while creating/updating item
    if (err.name === 'ValidationError')
      error = createAppError(err.message, 400);

    //error handling for invalid user token-id
    if (err.name === 'JsonWebTokenError')
      error = createAppError('Invalid token. Please log in again!', 401);
    //error handling for expired user token-id
    if (err.name === 'TokenExpiredError')
      error = createAppError('Token is expired. Please log in again!', 401);
    res.status(error.statusCode).render('error', {
      title: 'Something go wrong',
      msg: 'Please try again later!'
    });
  } else {
    console.error('ERROR 💥');
    res.status(err.statusCode).render('error', {
      title: 'Something go wrong',
      msg: 'Please try again later!'
    });
  }
};
