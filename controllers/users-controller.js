const uuid = require('uuid/v4');
const HttpError = require('../models/HttpError');
const { validationResult } = require('express-validator');
const User = require('../models/user');

let users = [
  {
    id: 'u1',
    name: 'Max Schwaz',
    email: 'test@test.com',
    password: 'test123'
  }
];

const getUsers = (req, res, next) => {
  res.json({ users: users });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data', 422)
    );
  }

  const { name, email, password, places } = req.body;
  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    return next(
      new HttpError('Something went wrong, check your credentials', 500)
    );
  }

  if (existingUser) {
    return next(new HttpError('User already exists! 🧐', 422));
  }

  const newUser = new User({
    name,
    email,
    password,
    places,
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQaO6-kArN9ZxMm_vbTfrslmI1xgqzN9boTsnI3Nh_c0HYr-urw'
  });

  try {
    await newUser.save();
  } catch (error) {
    return next(new HttpError('Could not save the user in DB', 500));
  }
  res.status(201).json({ user: newUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    return next(new HttpError('Login failed, check your credentials', 500));
  }

  if (!existingUser || existingUser.password !== password) {
    return next(new HttpError('Please check your credentials! 👀', 401));
  }

  res.status(200).json({ message: 'Login success!' });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
