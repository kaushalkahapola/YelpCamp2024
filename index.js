const { log } = require('console');
const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate')
const { reviewSchema } = require('./schemas.js');
const catchAsync = require('./utils/catchAsync')
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const Campground = require('./models/campground');
const campgrounds = require('./routes/campgrounds.js')
const Review = require('./models/review.js')
const ExpressError = require('./utils/ExpressError');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    // useCreateIndex: true,  // Correct option name
    useUnifiedTopology: true
});

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error'))
db.once('open', () => {
    log("Database Connected")
})

const app = express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))
app.use('/campgrounds',campgrounds)


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


app.get('/', (req, res) => {
    res.render('home')
})

app.post('/campgrounds/:id/reviews/new', ValidateReview, async (req,res)=>{
    const review = new Review(req.body.review)
    const campground = await Campground.findById(req.params.id)
    campground.reviews.push(review)
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
})

app.delete('/campgrounds/:id/reviews/:reviewId',catchAsync(async(req,res)=>{
    const {id,reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull:{reviews:reviewId}})
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = "oh No! Something Went Wrong"
    res.status(status).render('error', { err })
})


app.listen(8000, () => {
    log("Running on PORT 8000")
})