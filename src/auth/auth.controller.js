const jwt = require('jsonwebtoken');

const User = require('../users/user');
const Character = require('../characters/character');
const Badge = require('../badges/badge');

const AppError = require('../utils/appError.util');
const catchAsync = require('../utils/catchAsync.util');
const sendEmail = require('../utils/email.util');

// Create token
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

// Generic fn for sending response w/ token
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// Signup
exports.signup = catchAsync(async (req, res, next) => {
  const { username, email, password, characterId } = req.body;

  const character = await Character.findById(characterId).select('name avatar');

  const user = await User.create({
    username,
    email,
    password,
    character,
  });

  const users = await User.find({ role: 'user' });
  if (users.length === 1) {
    const badge = await Badge.findById('65335d072eee7695841b9aef');
    user.badges.push(badge);
    await user.save();
  }

  const verificationLink = `http://localhost:8000/api/v1/auth/verify/${user._id}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Verify Your Email',
      message: 'Confirm and verify your account',
      html: `Click <a href="${verificationLink}">here</a> to verify your email.`,
    });
    console.log('email sent');
  } catch (err) {
    console.log(err);
    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500,
    );
  }
  createSendToken(user, 201, res);
});

// Login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // If everything ok, send token to client
  createSendToken(user, 200, res);
});

exports.emailVerification = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError('No user found', 404));
  }

  user.verified = true;
  await user.save();

  res.redirect('http://localhost:5173/map');
});
