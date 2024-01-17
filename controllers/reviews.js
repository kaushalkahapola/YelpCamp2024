const Campground = require('../models/campground');
const Review = require('../models/review.js');

module.exports.createReview = async (req,res)=>{
    const review = new Review(req.body.review)
    const campground = await Campground.findById(req.params.id)
    campground.reviews.push(review)
    review.author = req.user._id
    await review.save();
    await campground.save();
    req.flash('success','Successfully added the review')
    res.redirect(`/campgrounds/${campground._id}`)
}


module.exports.deleteReview = async(req,res)=>{
    const {id,reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull:{reviews:reviewId}})
    const review = await Review.findByIdAndDelete(reviewId, {new:true})
    if(!review){
        req.flash('error','Review Not Found !!')
        return res.redirect('/campgrounds')
    }
    req.flash('success','Successfully deleted the review')
    res.redirect(`/campgrounds/${id}`)
}