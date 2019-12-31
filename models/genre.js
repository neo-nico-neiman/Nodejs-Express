var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var GenreSchema = new Schema (
    {
        name: {type: String, required: true, min: 3, max: 100}
    }
);

//Virtual for Genre's URL

GenreSchema
.virtual('url')
.get( function () {
    return '/catalog/genre/'+this._id;
});

//Export module
module.exports = mongoose.model('Genre', GenreSchema);