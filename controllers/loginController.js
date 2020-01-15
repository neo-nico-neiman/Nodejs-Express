const {check, validationResult} = require('express-validator');
const {sanitizeBody} = require('express-validator');
const bcrypt = require('bcryptjs');
const Login = require('../models/login');
let debug = require('debug')('login');


exports.logout = function(req,res,next) {
    req.session.isLogged=false;
    req.session.destroy( function (err){
      res.redirect('/');
    })
    
    };

exports.login_verify = [

    
     //Validate
     check('username', 'Please Enter a Valid Username')
     .isEmail(),
     check('password', 'Please enter a valid password').isLength({min: 4, max:10}),
 
     //Sanitize
     sanitizeBody('username').escape(),
     sanitizeBody('password').escape(),

     async (req, res, next) => {

      if (req.session.isLogged) next();
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('login', {message: errors.array()});
        }
    
        const { username, password } = req.body;
        try {
          let user = await Login.findOne({username}); 
          if (!user){
            return res.render('login', {message: 'Unexistent user'});
          }
          
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
              return res.render('login', {message: 'Incorrect Password !'});
            }
            
            //success
            req.session.isLogged = true;
            req.session.user = user;
            res.redirect('/catalog');

        } catch (e) {
            debug('update error:' + e);
            res.render('login', {message: 'Server Error'});
        }       
      }
    
];



exports.login_get = (req, res, next) => {
    res.render('login', {title: 'Login to access the library'});
}

exports.register_get = (req, res) => {
    res.render('register', {title: 'Register new user'});
}

exports.register_post = [
    //Validate
    check('username', 'Please Enter a Valid Username')
    .isEmail(),
    check('password', 'Please enter a valid password').isLength({min: 4, max:10}).trim(),
    check('firstName', 'Please enter a first name').isLength({min: 1}).trim(),
    check('lastName', 'Please enter a last name').isLength({min: 1}).trim(),

    //Sanitize
    sanitizeBody('username').escape(),
    sanitizeBody('password').escape(),
    sanitizeBody('firstName').escape(),
    sanitizeBody('lastName').escape(),
    
    async (req, res) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('register', {errors: errors.array()});
        }

        const { username, password, firstName, lastName } = req.body;
        try {
            let user = await Login.findOne({username});

            if (user) {
                return res.render('register', {message: 'Login Already Exists'});
            }
            let isAdmin = false;
            let admin_key = process.env.admin_key;
            if (username.includes(admin_key)) isAdmin = true;
            user = new Login({ username, password , isAdmin, firstName, lastName});

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save(err => {
                if (err) { 
                    debug('login error:' + err);
                    return next(err); 
                }
                res.redirect('/');
                
        });

           
        } catch (err) {
            debug('login error:' + err.message);
            return res.render('register', {message: '500 Error in Saving'});
        }
    }
]

