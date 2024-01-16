const express = require('express')
const  router  = express.Router({mergeParams: true})
const { reviewSchema } = require('../schemas.js');
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground');
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review.js')


const ValidateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else {
        next();
    }
}

router.post('/new', ValidateReview, async (req,res)=>{
    const review = new Review(req.body.review)
    const campground = await Campground.findById(req.params.id)
    campground.reviews.push(review)
    await review.save();
    await campground.save();
    req.flash('success','Successfully added the review')
    res.redirect(`/campgrounds/${campground._id}`)
})

router.delete('/:reviewId',catchAsync(async(req,res)=>{
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