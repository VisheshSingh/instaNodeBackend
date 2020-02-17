const axios = require('axios');
const HttpError = require('../models/HttpError');

const API_KEY = 'AIzaSyBRyOVtLFVvLzHf98hnb2NEcGyaCubmmYo';

async function getCoordsFromAddress(address) {
  const res = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${API_KEY}`
  );
  const data = res.data;

  if (!data || data.status === 'ZERO_RESULTS') {
    throw new HttpError(
      'Could not find the coordinates 🗺 to the specified location ',
      422
    );
  }

  const coords = data.results[0].geometry.location;
  return coords;
}

module.exports = getCoordsFromAddress;
