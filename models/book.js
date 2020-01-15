const mongoose = require('mongoose');
let Schema = mongoose.Schema;
let BookSchema = new Schema (
    {
        title: {type: String, required: true},
        author: {type: Schema.Types.ObjectId, ref: 'Author', required: true},
        summary: {type: String, required: true},
        isbn: {type: String, required: true},
        genre: [{type: Schema.Types.ObjectId, ref: 'Genre'}]
    }
);

//Virtual for Book's URL
BookSchema
.virtual('url')
.get( function () {
    return '/catalog/book/'+ this._id;
})

//Export model
module.exports = mongoose.model('Book', BookSchema);