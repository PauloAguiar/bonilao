var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('guesses', { title: 'About', siteTitle: 'My App' });
});

module.exports = router;
