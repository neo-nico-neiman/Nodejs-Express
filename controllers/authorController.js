var async = require('async');
var Books = require('../models/book');
var Author = require('../models/author');
var moment = require('moment');

// Display list of all Authors.
exports.author_list = function(req, res, next) {
    Author.find()
        .sort([['family_name', 'ascending']])
        .exec((err, author_list) => {
            if(err){ return next(err)};

            //Successfull, so render
            res.render('author_list', { title: 'Author List', all_author: author_list, moment: moment});
        })

};

// Display detail page for a specific Author.
exports.author_detail = (req, res, next) => {
    async.parallel({
        author: callback => {
            Author.findById(req.params.id)
                .exec(callback)
        },
        authors_books: callback => {
            Books.find({'author': req.params.id}, 'title summary')
                .exec(callback)
        }
    }, (err, results) => {
            if(err) {return next(err);}
            if(results.author==null) {
                var err = new Error('Author not found');
                err.status = 404;
                return (next(err));
            }
            res.render('author_detail', {title: 'Author Detail', 
                author: results.author, 
                author_books: results.authors_books,
                moment: moment}
            );
        });

    };


// Display Author create form on GET.
exports.author_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author create GET');
};

// Handle Author create on POST.
exports.author_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author create POST');
};

// Display Author delete form on GET.
exports.author_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author delete GET');
};

// Handle Author delete on POST.
exports.author_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author delete POST');
};

// Display Author update form on GET.
exports.author_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update GET');
};

// Handle Author update on POST.
exports.author_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update POST');
};