var moment = require('moment');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AuthorSchema = new Schema(
    {
        first_name: {type: String, required: true, max: 100},
        family_name: {type: String, required: true, max: 100},
        date_of_birth: {type: Date},
        date_of_death: {type: Date}
    }
);

//Virtual for Author's full name
AuthorSchema
.virtual('name')
.get(function () {

/* 
To avoid errors in cases where an author 
does not have either a family name or first name
We want to make sure we handle the exception by 
returning an empty string for that case
*/

    var fullname = '';
    if (this.first_name && this.family_name) {
        fullname = this.family_name + ', ' + this.first_name
    }
    if (!this.first_name || !this.family_name) {
        fullname = '';
    }

    return fullname; 
});

//Virtual for Author's lifespan
AuthorSchema
.virtual('lifespan')
.get(function () {
    return (this.date_of_death.getYear() - this.date_of_birth.getYear()).toString();
});

//Virtual for formatted DOB
AuthorSchema
.virtual('dob_formatted')
.get(function(){
    return this.date_of_birth ? moment(this.date_of_birth).format('YYYY/MM/DD') : '?';
});

//Virtual for formatted DOD
AuthorSchema
.virtual('dod_formatted')
.get(function(){
    return this.date_of_death ? moment(this.date_of_death).format('YYYY/MM/DD') : '?';
});

//Virtual for Author's URL

AuthorSchema
.virtual('url')
.get(function () {
    return '/catalog/author/' + this._id;
});

//Expor model
module.exports = mongoose.model('Author', AuthorSchema);

