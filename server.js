// THIRD-PARTY IMPORTS
const express = require('express');
const bodyParser = require('body-parser');

// OWN ROUTES
const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/HttpError');

// MIDDLEWARE
const app = express();
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError('Could not find the requested route 🚫');
  throw error;
});

// GRACEFUL ERROR HANDLING
app.use((err, req, res, next) => {
  if (res.headerSent) {
    return next(err);
  }
  res.status(err.code || 500);
  res.json({ message: err.message || 'An unknown error occured ☔' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}...`));
