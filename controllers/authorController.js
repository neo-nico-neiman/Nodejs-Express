const {body, validationResult} = require('express-validator');
const {sanitizeBody} = require('express-validator');
const async = require('async');
const Books = require('../models/book');
const Author = require('../models/author');

// Display list of all Authors.
exports.author_list = function(req, res, next) {
    Author.find()
        .sort([['family_name', 'ascending']])
        .exec((err, author_list) => {
            if(err){ return next(err)};

            //Successfull, so render
            res.render('author_list', 
                { title: 'Author List', 
                all_author: author_list}
            );
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
                let err = new Error('Author not found');
                err.status = 404;
                return (next(err));
            }
            res.render('author_detail', {title: 'Author Detail', 
                author: results.author, 
                author_books: results.authors_books                
                }
            );
        });
    };


// Display Author create form on GET.
exports.author_create_get = function(req, res) {
    res.render('author_form', 
        {title: 'Create Author'}
    );
};

// Handle Author create on POST.
exports.author_create_post = [
    //validate fields
    body('first_name')
        .isLength({min: 1})
        .trim()
        .withMessage('First name must be specified.')
        .isAlphanumeric()
        .withMessage('First name has non-alphanumeric characters'),
    body('family_name')
        .isLength({min: 1})
        .trim()
        .withMessage('Family name must be specified')
        .isAlphanumeric()
        .withMessage('Family name has non-alphanumeric characters'),
    body('date_of_birth', 'Invalid date of birth')
        .optional({checkFalsy: true})
        .isISO8601(),
    body('date_of_death', 'Invalid date of death')
        .optional({checkFalsy: true})
        .isISO8601(),
    
    //Sanitize data
    sanitizeBody('first_name').escape(),
    sanitizeBody('family_name').escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),

    //Process request after validation and sanitization
    (req, res, next) => {

        //Extract the validation errors from a request
        let errors = validationResult(req);

        if(!errors.isEmpty()) {
            //There are errors. Render form with sanitized values
            res.render('author_form',
                {title: 'Create Author',
                author: req.body,
                errors: errors.array()}
            );
            return;
        }
        else{
            //Data form is valid

            //Create Author object with escaped and trimmed data
            let author = new Author(
                {
                    first_name: req.body.first_name,
                    family_name: req.body.family_name,
                    date_of_birth: req.body.date_of_birth,
                    date_of_death: req.body.date_of_death
                }
            );
            //Check if Author already exists
            Author.findOne(
                {'first_name': req.body.first_name, 
                'last_name': req.body.last_name, 
                'date_of_birth': req.body.date_of_birth,
                'date_of_death': req.body.date_of_death
                }).exec( (err, found_author) => {
                if (err) { return next(err); }

                //if author exist
                else if (found_author){
                    res.redirect(found_author.url);
                }
                else{
                //if !err || !found_author then create a new Author
                author.save( err => {
                    if (err) { return next(err); }

                    //Successful - redirect to new author record
                    res.redirect(author.url);
                }); 
            }
        }); 

        }
    }
]

// Display Author delete form on GET.
exports.author_delete_get = function(req, res, next) {
    async.parallel({
        author: callback => {
            Author.findById(req.params.id)
                .exec(callback)
        },
        author_books: callback => {
            Books.find({'author': req.params.id})
                .exec(callback)
        }
    }, (err, results) => {
        if (err) { return next(err);}
        if (results==null){
            res.redirect('/catalog/authors');
        }
        //Success
        res.render(
             'author_delete', 
            {title: 'Delete Author', 
             author: results.author,
             author_books: results.author_books
            }
        );
    });
};

// Handle Author delete on POST.
exports.author_delete_post = (req, res, next) => {
    async.parallel({
        author: callback => {
          Author.findById(req.body.authorid).exec(callback)
        },
        authors_books: callback => {
          Books.find({ 'author': req.body.authorid }).exec(callback)
        },
    }, (err, results) => {
        if (err) { return next(err); }
        // Success
        if (results.authors_books.length > 0) {
            // Author has books. Render in same way as for GET route.
            res.render('author_delete', 
                { title: 'Delete Author', 
                author: results.author, 
                author_books: results.authors_books} 
            );
            return;
        }
        else {
            // Author has no books. Delete object and redirect to the list of authors.
            Author.findByIdAndRemove(req.body.authorid, function deleteAuthor (err) {
                if (err) { return next(err); }
                // Success - go to author list
                res.redirect('/catalog/authors')
            })
        }
    });
};

// Display Author update form on GET.
exports.author_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update GET');
};

// Handle Author update on POST.
exports.author_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update POST');
};