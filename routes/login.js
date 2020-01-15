const express = require('express');
const router = express.Router();
const login_controller = require('../controllers/loginController');
const book_controller = require('../controllers/bookController');

//Get register
router.get('/register', login_controller.register_get);
//Post Register
router.post('/register', login_controller.register_post);
// Get login
router.get('/', login_controller.login_get);
//Post login
router.post('/', login_controller.login_verify, book_controller.index);



router.post('/logout', login_controller.logout);


module.exports = router;