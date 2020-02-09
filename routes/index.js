var express = require('express');
var router = express.Router();
var kompaJsonDataService = require('../src/KompaJsonDataService');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET home page. */
router.get('/start', function(req, res, next) {
  kompaJsonDataService.start();

  res.send("Done");
});

module.exports = router;
