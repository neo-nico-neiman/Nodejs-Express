const validator = require('express-validator');
const Book = require('../models/book');
const async = require('async');
const Genre = require('../models/genre');

// Display list of all Genre.
exports.genre_list = function(req, res, next) {
    Genre.find()
    .sort([['name', 'ascending']])
    .exec( (err, list_genre) => {
        if(err){ return next(err)};
        res.render('genre_list', 
            {title: 'Genre List', 
            genre_list: list_genre}
        );
    });
};

// Display detail page for a specific Genre.
exports.genre_detail = function(req, res, next) {
    async.parallel({
        genre: callback => {
            Genre.findById(req.params.id)
                .exec(callback);
        },
        genre_books: callback => {
            Book.find({ 'genre': req.params.id})
                .exec(callback);
        }
    }, (err, results) => {
            if(err) {return next(err);}
            if (results.genre==null){//No results
                let err = new Error('Genre Not Found');
                err.status = 404;
                return next(err);
            }
            //Successfull, so render
    
            res.render('genre_detail', 
                {title: 'Genre Detail', 
                genre: results.genre, 
                genre_books: results.genre_books} 
            );
    });
};

// Display Genre create form on GET.
exports.genre_create_get = function(req, res, next) {
    res.render('genre_form', 
        {title: 'Create Genre'});
};

// Handle Genre create on POST.
exports.genre_create_post = [

    //Validate that the name field is not empty
    validator.body('name', 'Genre name required').isLength({min: 1}).trim(), 

    //sanitize (escape) the name field
    validator.sanitizeBody('name').escape(), 

    // Process request after validation and sanitization
    (req, res, next) => {

        //Extract the validation errors from a request
        let errors = validator.validationResult(req);

        //Create a genre object with escaped and trimmed data
        let genre = new Genre(
            {name: req.body.name }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/ errors
            res.render('genre_form', 
                {title: 'Create Genre',
                 genre: genre, 
                 errors: errors.array()}
            );
            return;
        }
        else {
            //Data form is valid
            //Check if Genre with same name already exists
            Genre.findOne({'name': req.body.name})
                .exec( (err, found_genre) => {
                if(err) {return next(err); }

                if(found_genre) {
                    //genre exist, redirect to its detail page
                    res.redirect(found_genre.url);
                }
                else{

                    genre.save( err => {
                        if(err) {return next(err);}

                        //Genre saved. Redirect to genre detail page
                        res.redirect(genre.url);
                    });
                }
            });
        }
    }
];

// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res) {
    res.render('genre_form_delete', 
        {title: 'Genre Delete'}
    );
    
};

// Handle Genre delete on POST.
exports.genre_delete_post = [
    
    validator.body('name', 'Genre name required').isLength({min: 1}).trim(), 
    validator.sanitizeBody('name').escape(), 
    (req, res, next) => {

        let errors = validator.validationResult(req);

        let genre = new Genre(
            {name: req.body.name }
        );

        if(!errors.isEmpty()){
            res.render('genre_form_delete', 
                {title: 'Genre Delete', 
                genre: genre, 
                errors: errors.array()}
            );
            return;
        }
        else{

        }
        Genre.deleteOne({'name': req.body.name})
            .exec((err, results) => {
                if(err) {return next(err);}
                if(results==null) {
                    let err = new Error('No genre with this name');
                    err.status = 404;
                    return next(err);
                }
                res.redirect('/catalog/genres');
            })
    }
]

// Display Genre update form on GET.
exports.genre_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update GET');
};

// Handle Genre update on POST.
exports.genre_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update POST');
};