var express = require('express');
var database = require('../database');

var router = express.Router();

router.get('/', function(req, res, next) {
  var points = database.getPoints();
  
  points.sort(function(a, b) {
    return b.points - a.points;
  });

  res.render('ranking', { 
    title: 'Ranking', 
    points: points 
  });
});

module.exports = router;
