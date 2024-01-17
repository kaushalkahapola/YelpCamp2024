const express = require('express')
const  router  = express.Router({mergeParams: true})
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground');
const Review = require('../models/review.js');
const reviews = require('../controllers/reviews.js')
const {ValidateReview,isLoggedIn,isReviewAuthor} = require('../middleware.js')


router.post('/new',isLoggedIn, ValidateReview, reviews.createReview)

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router