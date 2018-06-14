var express = require('express');
var database = require('../database');

var router = express.Router();

router.get('/', function(req, res, next) {
  var endDate = new Date(Date.now());
  var startDate = new Date(endDate);
  startDate.setYear(startDate.getYear() - 1);

  //endDate.setHours(endDate.getHours() + 96);

  var matches = database.getMatches(startDate,  endDate);
  
  matches.sort(function(a, b) {
    return b.time - a.time;
  });

  res.render('results', { 
    title: 'Resultados', 
    matches: matches
  });
});

module.exports = router;
