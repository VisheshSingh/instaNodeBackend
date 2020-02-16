const uuid = require('uuid/v4');
const HttpError = require('../models/HttpError');

const DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Empire State Building',
    description: 'One of the most famous skyscrapers in the world',
    location: {
      lat: 42.0216933,
      lng: -92.6417148
    },
    address: '20 W 34th St, New York, NY 10001',
    creator: 'u1'
  }
];

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find(p => p.id === placeId);

  if (!place) {
    const error = new HttpError(
      ' Could not find the place with place id 😑',
      404
    );
    throw error;
  }

  res.json({ place });
};

const getPlaceByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const place = DUMMY_PLACES.find(p => p.creator === userId);

  if (!place) {
    return next(
      new HttpError(' Could not find the place with user id 😫', 404)
    );
  }

  res.json({ place });
};

const createPlace = (req, res, next) => {
  const { title, description, coordinates, address, creator } = req.body;

  const newPlace = {
    id: uuid(),
    title,
    description,
    location: coordinates,
    address,
    creator
  };

  res.status(201).json({ place: newPlace });
};

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.createPlace = createPlace;
