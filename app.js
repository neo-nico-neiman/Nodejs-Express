const config = require('./config.js');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const usersRouter = require('./routes/users');
const catalogRouter = require('./routes/catalog');
const loginRouter = require('./routes/login');
const loginController = require('./controllers/loginController');
const auth = require('./controllers/auth');

const app = express();

//Set up Mongoose connection
const mongoose = require('mongoose');
let mongoDB = config.mongoDB;
mongoose.connect(mongoDB, {useNewUrlParser: true});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


// view engine setup
//1st set the directory where the views are located
//2nd set the view engine, in this case pug
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//set up session
app.use(
  session({
    secret: process.env.session_secret,
    name: process.env.session_name,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 15,
      sameSite: true 
    }
  })
);


//Redirect to login Form
app.use('/', loginRouter);
app.use('/logout', loginController.logout);
app.use('/users', auth, usersRouter);
app.use('/catalog', auth, catalogRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
