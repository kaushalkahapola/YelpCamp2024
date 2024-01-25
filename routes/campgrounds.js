const express = require('express')
const  router  = express.Router({mergeParams: true})
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground');
const campgrounds = require('../controllers/campgrounds.js')
const ExpressError = require('../utils/ExpressError');
const { isLoggedIn, isAuthor, ValidateCampground } = require('../middleware.js')
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage: storage });


router.route('/')
    .get( catchAsync(campgrounds.index))
    .post( isLoggedIn , upload.array('image'),ValidateCampground,catchAsync(campgrounds.new))
    // .post(upload.array('image'),(req,res)=>{
    //     console.log(req.body,req.files)
    //     res.send('IT WORKED')
    // })

router.get('/new', isLoggedIn , campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.show))
    .put(isLoggedIn,isAuthor,upload.array('image'), ValidateCampground, catchAsync(campgrounds.edit))
    .delete( isLoggedIn,isAuthor, catchAsync(campgrounds.delete))

router.get('/:id/edit',isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router