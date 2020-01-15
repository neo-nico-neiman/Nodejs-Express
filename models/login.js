const mongoose = require('mongoose');
require ('mongoose-type-email');
let Schema = mongoose.Schema;

let LoginSchema = new Schema(
    {
        username: {type: mongoose.SchemaTypes.Email, require: true, unique: true},
        password: {type: String, require: true, min: 4, max: 10},
        firstName: {type: String, require: true, min: 1},
        lastName: {type: String, require: true, min: 1},
        isAdmin: {type: Boolean, default: false}
    }
)

//Export model
module.exports = mongoose.model('Login', LoginSchema);