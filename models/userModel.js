const mongoose = require('mongoose');
const { hash, compare } = require('bcrypt');

const { isEmail, isStrongPassword } = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name!'],
      trim: true,
      maxLength: [20, 'Name must have less or equal then 20 characters'],
      minLength: [3, 'Name must have more or equal then 3 characters'],
      validate: [
        (value) => /^[a-zA-Z]+(?:[' -][a-zA-Z]+)*$/.test(value),
        'Name only allows alphabets, spaces, hyphens or apostrophes characters. Name must start and end only with alphabets'
      ]
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [
        /*(value) => isEmail(value)*/ isEmail,
        'Please provide a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minLength: [8, 'Password must have more or equal then 8 characters'],
      maxLength: [20, 'Password must have less or equal then 20 characters'],
      validate: [
        (value) => isStrongPassword(value, { minSymbols: 0 }),
        'Password must contain at least 1 uppercase, 1 lowercase, and 1 number'
      ],
      select: false
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Password confirmation is required'],
      validate: [
        //This only works on CREATE and SAVE! (authController.js :5)
        function (value) {
          return value === this.password;
        },
        'Passwords are not the same'
      ]
    },
    photo: { type: String },
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user'
    }
  },
  { toJSON: { virtuals: true } }
);

userSchema.pre('save', async function (next) {
  //Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  //encrypt the password with cost of 12
  this.password = await hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async (candidatePassword, userPassword) =>
  await compare(candidatePassword, userPassword);

const User = mongoose.model('User', userSchema);

module.exports = User;
