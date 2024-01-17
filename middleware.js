const { campGroundSchema, reviewSchema } = require('./schemas.js');
const Campground = require('./models/campground');
const Review = require('./models/review.js')
const ExpressError = require('./utils/ExpressError');


module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be log in first !!');
        return res.redirect('/login')
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.isAuthor = async (req,res,next)=>{
    const { id } = req.params
    const campground = await Campground.findById(id)
    if(!campground.author.equals(req.user._id)){
        req.flash('error',"Sorry !! You do not have the persmission to that action")
        return res.redirect(`/campgrounds/${campground._id}`)
    }
    next()
}
module.exports.isReviewAuthor = async (req,res,next)=>{
    const { id, reviewId } = req.params
    const review = await Review.findById(reviewId)
    if(!review.author.equals(req.user._id)){
        req.flash('error',"Sorry !! You do not have the persmission to that action")
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

module.exports.ValidateCampground = (req, res, next) => {
    const { error } = campGroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else {
        next();
    }
}

module.exports.ValidateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else {
        next();
    }
}