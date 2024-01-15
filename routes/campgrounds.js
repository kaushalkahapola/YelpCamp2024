const express = require('express')
const  router  = express.Router({mergeParams: true})
const { campGroundSchema } = require('../schemas.js');
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground');
const ExpressError = require('../utils/ExpressError');

const ValidateCampground = (req, res, next) => {
    const { error } = campGroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else {
        next();
    }
}

router.get('/', catchAsync(async (req, res) => {
    const camps = await Campground.find({})
    res.render('campgrounds/index', { camps })
}))

router.post('/', ValidateCampground, catchAsync(async (req, res) => {
    if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const camp = new Campground(req.body.campground)
    await camp.save()
    res.redirect(`/campgrounds/${camp._id}`)
}))



router.get('/new', (req, res) => {
    res.render('campgrounds/new')
})

router.get('/:id', catchAsync(async (req, res) => {

    const { id } = req.params
    const campground = await Campground.findById(id).populate('reviews')
    res.render('campgrounds/show', { campground })
}))

router.put('/:id', ValidateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${id}`)
}))

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}))

router.get('/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
}))

module.exports = router