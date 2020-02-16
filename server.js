// THIRD-PARTY IMPORTS
const express = require('express');
const bodyParser = require('body-parser');

// OWN ROUTES
const placesRoutes = require('./routes/places-routes');

// MIDDLEWARE
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/places', placesRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}...`));
