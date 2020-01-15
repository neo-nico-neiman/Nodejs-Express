const session = require('express-session');

module.exports = function(req, res, next) {
 
    let isLogin = req.session.isLogged;

    if ( !isLogin) {
      return res.render('login', {message: 'You must login to access the library'})
    } else {
      res.locals.user = req.session.user;
      res.locals.all = req.session;
      return next();
    }
  };