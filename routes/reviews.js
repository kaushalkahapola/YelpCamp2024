const express = require('express')
const  router  = express.Router({mergeParams: true})
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground');
const Review = require('../models/review.js');
const {ValidateReview,isLoggedIn,isReviewAuthor} = require('../middleware.js')


router.post('/new',isLoggedIn, ValidateReview, async (req,res)=>{
    const review = new Review(req.body.review)
    const campground = await Campground.findById(req.params.id)
    campground.reviews.push(review)
    review.author = req.user._id
    await review.save();
    await campground.save();
    req.flash('success','Successfully added the review')
    res.redirect(`/campgrounds/${campground._id}`)
})

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async(req,res)=>{
    const {id,reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull:{reviews:reviewId}})
    const review = await Review.findByIdAndDelete(reviewId, {new:true})
    if(!review){
        req.flash('error','Review Not Found !!')
        return res.redirect('/campgrounds')
    }
    req.flash('success','Successfully deleted the review')
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router