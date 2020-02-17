const uuid = require('uuid/v4');
const HttpError = require('../models/HttpError');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const getCoordsFromAddress = require('../utils/location');
const Places = require('../models/places');
const User = require('../models/user');

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

// GET PLACE BY PLACE ID
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
    return next(error);
  }

  res.json({ place: place.toObject({ getters: true }) });
};

// GET PLACE BY USER ID
const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userWithPlaces;

  try {
    userWithPlaces = await User.findById(userId).populate('places');
  } catch (error) {
    const err = new HttpError('Failed to fetch the places', 500);
    return next(err);
  }

  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(
      new HttpError(' Could not find the places for user id 😫', 404)
    );
  }

  res.json({
    places: userWithPlaces.places.map(place =>
      place.toObject({ getters: true })
    )
  });
};

// CREATE PLACE
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

  let user;

  try {
    user = await User.findById(creator);
  } catch (error) {
    return next(
      new HttpError('Something went wrong, creating place failed', 500)
    );
  }

  if (!user) {
    return next(
      new HttpError('Could not find the user with the specified id', 404)
    );
  }

  console.log(user);

  try {
    const sess = await mongoose.startSession(); // CREATE MONGOOSE SESSION
    sess.startTransaction(); // START TRANSACTION
    await newPlace.save({ session: sess }); // SAVE PLACE IN SESSION
    user.places.push(newPlace); // TIE CREATOR TO A PLACE (ADD PLACE ID TO USER)
    await user.save({ session: sess }); // SAVE USER
    await sess.commitTransaction(); // COMMIT TRANSAFCTION
  } catch (error) {
    const err = new HttpError('Could not save the place in DB');
    return next(err);
  }
  res.status(201).json({ place: newPlace });
};

// UPDATE PLACE
const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError('Invalid inputs passed, please check your data', 422)
    );
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
    return next(error);
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

// DELETE PLACE
const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Places.findById(placeId).populate('creator');
  } catch (error) {
    return next(
      new HttpError('Something went wrong, could not delete the place 😓')
    );
  }

  if (!place) {
    return next(new HttpError('Could not find a place with specified id', 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    return next(new HttpError('Could not find a place to delete 🥱'));
  }

  res.status(200).json({ message: 'Deleted place ✂' });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
