var express = require('express');
var database = require('../database');

var router = express.Router();

router.get('/', function(req, res, next) {
  var points = database.getRankings();
  
  points.sort(function(a, b) {
    return b.points - a.points;
  });
  var length = points.length
  if (length > 0)
  {
    var rank = 0;
    points[0].rank = rank;
    
    for (var i = 1; i < length; i++)
    {
      if (points[i].points < points[i-1].points)
              rank++;

      points[i].rank = rank;
    }
  }

  res.render('ranking', { 
    title: 'Ranking', 
    points: points 
  });
});

module.exports = router;
