const uuid = require('uuid/v4');
const HttpError = require('../models/HttpError');

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

const signup = (req, res, next) => {
  const { name, email, password } = req.body;
  const hasUser = users.find(u => u.email === email);

  if (hasUser) {
    throw new HttpError('User already exists! 🧐', 422);
  }

  const newUser = {
    id: uuid(),
    name,
    email,
    password
  };

  users.push(newUser);
  res.status(201).json({ user: newUser });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);

  if (!user || user.password !== password) {
    return next(new HttpError('Please check your credentials! 👀', 401));
  }

  res.status(200).json({ message: 'Login success!' });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
