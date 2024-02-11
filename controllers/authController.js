const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const { createHash } = require('crypto');

const { catchAsync } = require('../utils/catchAsync');
const { createAppError } = require('../utils/appError');
const { sendEmail } = require('../utils/email');

const User = require('../models/userModel');

const createTokenById = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
const createSendToken = (user, statusCode, res) => {
  const token = createTokenById(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  //remove 'password' and 'active' status from output
  user.password = undefined;
  user.active = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(createAppError('Please provide email and password', 400));
  }
  const user = await User.findOne({ email }).select('+password');
  // const isCorrectPwd = await user?.correctPassword(password, user.password);

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(createAppError('Incorrect email or password', 401));

  createSendToken({ _id: user._id }, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //  Get the token
  let token = '';
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ').at(1);
  } else if (req.cookies.jwt) token = req.cookies.jwt;

  if (!token) {
    return next(
      createAppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  //Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      createAppError(
        'The user belonging to this token does no longer exist',
        401
      )
    );

  //Check if user changed PWD after the JWT was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      createAppError(
        'User recently changed password! Please log in again.',
        401
      )
    );
  }

  //Access to protected route is granted
  req.user = currentUser;
  next();
});

// Only for rendered pages, no errors
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    //Verification token
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
    //Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) return next();

    //Check if user changed PWD after the JWT was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) return next();

    //There is a logged-in user
    res.locals.user = currentUser;
    return next();
  }
  next();
});
//restricts actions for everyone besides: roles[]
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        createAppError(
          'You do not have permission to perform this action.',
          403
        )
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      createAppError('There is no user with provided email address', 400)
    );
  }
  //Generate random reset token
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  //send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message
    });

    res.status(200).json({ status: 'success', message: 'Token sent to email' });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });
    return next(
      createAppError('There was an error sending email. Try again later.', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //get user based on the token
  const hashedToken = createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() }
  });

  // if token has not expired and there in user: set new password
  if (!user) {
    return next(createAppError('Token is invalid or expired.', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //update changedPasswordAt property for the user
  //log the user in, send JWT
  createSendToken({ _id: user._id }, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //get user from collection
  const user = await User.findById(req.user._id).select('+password');
  //check POSTed password is correct
  const isCorrectPwd = await user.correctPassword(
    req.body.passwordCurrent,
    user.password
  );
  if (!isCorrectPwd)
    return next(
      createAppError('Your current password is wrong. Please try again.', 401)
    );
  if (req.body.password === req.body.passwordCurrent)
    return next(
      createAppError(
        'Password must be different to your current password.',
        400
      )
    );

  //if so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //log user in, send JWT
  createSendToken({ _id: user._id }, 200, res);
});
