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
    passwordConfirm: req.body.passwordConfirm
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
  console.log(token);
  //Verification token
  if (!token) {
    return next(
      createAppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  //Check if user still exists

  //Check if user changed PWD after the JWT was issued
  next();
});
