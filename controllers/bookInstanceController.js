const async = require('async');
const { body,validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');
const Book = require('../models/book');
const BookInstance = require('../models/bookinstance');


// Display list of all BookInstances.
exports.bookinstance_list = function(req, res, next) {
    BookInstance.find()
        .populate('book')
        .exec((err, list_bookinstances) => {
            if (err) {return next(err);}
            //Successful, so render
            res.render('bookinstance_list', 
                { 
                title: 'Book Instance List', 
                bookinstance_list: list_bookinstances}
            );
        });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res, next) {
    BookInstance.findById(req.params.id)
        .populate('book')
        .exec((err, bookinstance) => {
            if(err){ return next(err);}
            if(bookinstance==null){
                let err = new Error('Book copy not found')
                err.status = 404;
                return next(err);
            }
            res.render('bookinstance_detail', 
                {title: 'Copy: '+bookinstance.book.title,
                bookinstance: bookinstance}
            );
        });
    
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req, res, next) {       

    Book.find({},'title')
    .exec(function (err, books) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('bookinstance_form', 
        {title: 'Create BookInstance', 
        book_list: books});
    });
    
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [

    // Validate fields.
    body('book', 'Book must be specified').isLength({ min: 1 }).trim(),
    body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
    
    // Sanitize fields.
    sanitizeBody('book').escape(),
    sanitizeBody('imprint').escape(),
    sanitizeBody('status').trim().escape(),
    sanitizeBody('due_back').toDate(),
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        let errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        let bookinstance = new BookInstance(
          { book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Book.find({},'title')
                .exec(function (err, books) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('bookinstance_form', 
                        { title: 'Create BookInstance', 
                        book_list: books, 
                        selected_book: bookinstance.book._id, 
                        errors: errors.array(), 
                        bookinstance: bookinstance}
                    );
            });
            return;
        }
        else {
            // Data from form is valid.
            bookinstance.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new record.
                   res.redirect(bookinstance.url);
                });
        }
    }
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = (req, res, next) => {
    async.parallel({
        bookInstance: callback => {
            BookInstance.findById(req.params.id)
                .populate('book')
                .exec(callback)}
        }, 
        (err, results) => {
            if (err) { return next(err);}
            if(results==null){
                res.redirect('/catalog/bookinstances');
            }
            //Success, render
            res.render('bookinstance_delete',
                {title: 'Delete Instance',
                bookinstance: results.bookInstance}
            )
        }
    );

};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = (req, res, next) => {
    async.parallel({
        bookinstance: callback => { 
            BookInstance.findById(req.body.bookinstanceid)
            .populate('book')
            .exec(callback) } 
        }
        , (err, results) => {
            if (err) {return next(err); }
            if (results.bookinstance.status === 'Loaned'){
                res.render('bookinstance_delete', 
                    {title: 'Delete Instance', 
                    bookinstance: results.bookinstance, 
                    message: ['This action is not recommended!.', 
                            'First, retrieve this book instance from the library member.']
                    })
            }
            else{
                BookInstance.findByIdAndRemove(req.body.bookinstanceid, function deleteBookInstance (err) {
                    if (err) { return next(err); }
                    //Success, go to Books list
                    res.redirect('/catalog/bookinstances')
                });
            }
        }
    );
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res, next) {
    async.parallel({ 
        bookinstance: callback => { 
            BookInstance.findById(req.params.id)
            .populate('book')
            .exec(callback)
            },
        books:  callback => {
            Book.find()
                .exec(callback);
            }       
        }, 
        (err, results) => {
        if (err) {return next(err); }
        if (results.bookinstance == null) {
            let err = new Error ('Book Instance not found');
            err.status = 404;
            return next(err);
        }
        res.render('bookinstance_form', 
            {title: 'Update Book Instance', 
            bookinstance: results.bookinstance,
            book_list: results.books});
        }
    );
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [ 
    //validate fieds
    body('book', 'Book must not be empty').isLength({min: 1}).trim(),
    body('imprint', 'Imprint must not be empty').isLength({min: 1}).trim(),
    body('due_back', 'Provide a valid date').optional({checkFalsy: true}).isISO8601(),
    body('status', 'Status must not be specified').isLength({min: 1}).trim(),

    //Sanitize data
    sanitizeBody('book').escape(),
    sanitizeBody('imprint').escape(),
    sanitizeBody('due_back').toDate(),
    sanitizeBody('status').escape(), 

    //process request after validation and sanitization
    (req, res, next) => {

        // Extract the validation errors from a request.
        let errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        let bookinstance = new BookInstance(
          { book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
            _id: req.params.id 
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Book.find({},'title')
                .exec(function (err, books) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('bookinstance_form', 
                        { title: 'Create BookInstance', 
                        book_list: books, 
                        errors: errors.array(), 
                        bookinstance: bookinstance}
                    );
            });
            return;
        }
        else {
            // Data from form is valid.
            BookInstance.findByIdAndUpdate(req.params.id, bookinstance, function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new record.
                   res.redirect(bookinstance.url);
                });
        }
    }
]