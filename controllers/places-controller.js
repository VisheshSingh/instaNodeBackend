const uuid = require('uuid/v4');
const HttpError = require('../models/HttpError');
const { validationResult } = require('express-validator');

const getCoordsFromAddress = require('../utils/location');
const Places = require('../models/places');

let DUMMY_PLACES = [
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

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Places.findById(placeId);
  } catch (error) {
    const err = new HttpError('Failed to retrieve data 😯', 500);
    return next(err);
  }

  if (!place) {
    const error = new HttpError(
      ' Could not find the place with place id 😑',
      404
    );
    throw error;
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let places;

  try {
    places = await Places.find({ creator: userId });
  } catch (error) {
    const err = new HttpError('Failed to fetch the places', 500);
    return next(err);
  }

  if (!places || places.length === 0) {
    return next(
      new HttpError(' Could not find the places for user id 😫', 404)
    );
  }

  res.json({ places: places.map(place => place.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError('Invalid inputs passed, please check your data', 422)
    );
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsFromAddress(address);
  } catch (err) {
    return next(err);
  }

  const newPlace = new Places({
    title,
    description,
    image: 'https://media2.trover.com/T/5459955326c48d783f000450/fixedw.jpg',
    location: coordinates,
    address,
    creator
  });

  try {
    await newPlace.save();
  } catch (error) {
    const err = new HttpError('Could not save the place in DB');
    return next(err);
  }
  res.status(201).json({ place: newPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError('Invalid inputs passed, please check your data', 422);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;
  let place;

  try {
    place = await Places.findById(placeId);
  } catch (error) {
    const err = new HttpError(
      'Something went wrong, could not update the place',
      500
    );
  }

  if (!place) {
    const error = new HttpError(
      ' Could not update the place with place id 😑',
      404
    );
    throw error;
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (error) {
    return next(
      new HttpError('Something went wrong while saving the document', 404)
    );
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;
  if (!DUMMY_PLACES.findIndex(p => p.id === placeId)) {
    throw new HttpError('Could not find a place to delete 🥱');
  }
  const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);

  DUMMY_PLACES = DUMMY_PLACES.splice(1, placeIndex);
  console.log(DUMMY_PLACES);
  res.status(200).json({ message: 'Deleted place ✂' });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
