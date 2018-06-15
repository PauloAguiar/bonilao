var express = require('express');
var database = require('../database');

var router = express.Router();

router.get('/', function(req, res, next) {
  var points = database.getPoints();
  
  points.sort(function(a, b) {
    return b.time - a.time;
  });

  res.render('points', { 
    title: 'Pontuações',
    points: points
  });
});

module.exports = router;
