var express = require('express');
var database = require('../database');

var router = express.Router();

var app = express();
router.get('/', function(req, res, next) {

  var startDate = new Date(Date.now());
  var endDate = new Date(startDate);
  endDate.setHours(startDate.getHours() + 24);

  var matches = database.getMatches(startDate,  endDate);

  res.render('guesses', { 
    title: 'Palpites', 
    matches: matches 
  });
});

module.exports = router;
