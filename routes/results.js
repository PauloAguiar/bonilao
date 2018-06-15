var express = require('express');
var database = require('../database');

var router = express.Router();

router.get('/', function(req, res, next) {
  var matches = database.getResults();
  
  matches.sort(function(a, b) {
    return b.time - a.time;
  });

  res.render('results', { 
    title: 'Resultados', 
    matches: matches
  });
});

module.exports = router;
