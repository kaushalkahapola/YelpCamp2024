const express = require('express')
const  router  = express.Router({mergeParams: true})
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground');
const campgrounds = require('../controllers/campgrounds.js')
const ExpressError = require('../utils/ExpressError');
const { isLoggedIn, isAuthor, ValidateCampground } = require('../middleware.js')


router.route('/')
    .get( catchAsync(campgrounds.index))
    .post( isLoggedIn , ValidateCampground, catchAsync(campgrounds.new))

router.get('/new', isLoggedIn , campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.show))
    .put(isLoggedIn,isAuthor, ValidateCampground, catchAsync(campgrounds.edit))
    .delete( isLoggedIn,isAuthor, catchAsync(campgrounds.delete))

router.get('/:id/edit',isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router