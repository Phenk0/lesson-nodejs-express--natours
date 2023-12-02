const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const { catchAsync } = require('../utils/catchAsync');
const { createAppError } = require('../utils/appError');

const User = require('../models/userModel');

const createTokenById = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt
  });
  const token = createTokenById(newUser._id);

  res.status(200).json({ status: 'success', token, data: { user: newUser } });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(createAppError('Please provide email and password', 400));
  }
  const user = await User.findOne({ email }).select('+password');
  const isCorrectPwd = await user?.correctPassword(password, user.password);

  if (!user || !isCorrectPwd)
    return next(createAppError('Incorrect email or password', 401));

  const token = createTokenById(user._id);

  res.status(200).json({ status: 'success', token });
});

exports.protect = catchAsync(async (req, res, next) => {
  //  Get the token
  let token = '';
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ').at(1);
  }

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
