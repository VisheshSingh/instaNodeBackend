const express = require('express');
const router = express.Router();

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

router.get('/:pid', (req, res) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find(p => p.id === placeId);
  if (!place) {
    return res
      .status(404)
      .json({ message: 'Could not find the place with place id 😑' });
  }

  res.json({ place });
});

router.get('/user/:uid', (req, res) => {
  const userId = req.params.uid;
  const place = DUMMY_PLACES.find(p => p.creator === userId);

  if (!place) {
    return res
      .status(404)
      .json({ message: 'Could not find the place with user id 😫' });
  }

  res.json({ place });
});

module.exports = router;
