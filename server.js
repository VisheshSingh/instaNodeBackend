// THIRD-PARTY IMPORTS
const express = require('express');
const bodyParser = require('body-parser');

// OWN ROUTES
const placesRoutes = require('./routes/places-routes');

// MIDDLEWARE
const app = express();
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/places', placesRoutes);

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
