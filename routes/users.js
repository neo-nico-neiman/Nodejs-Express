const express = require('express');
let router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('users', { name: 'Nico' });
});

module.exports = router;
