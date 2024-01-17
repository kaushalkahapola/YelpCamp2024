const express = require('express')
const  router  = express.Router({mergeParams: true})
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground');
const ExpressError = require('../utils/ExpressError');
const { isLoggedIn, isAuthor, ValidateCampground } = require('../middleware.js')


router.get('/', catchAsync(async (req, res) => {
    const camps = await Campground.find({})
    res.render('campgrounds/index', { camps })
}))

router.post('/', isLoggedIn , ValidateCampground, catchAsync(async (req, res) => {
    if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const camp = new Campground(req.body.campground)
    camp.author = req.user._id
    await camp.save()
    req.flash('success','Successfully added a new campground')
    res.redirect(`/campgrounds/${camp._id}`)
}))



router.get('/new', isLoggedIn , (req, res) => {
    res.render('campgrounds/new')
})

router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id).populate({
        path:'reviews',
        populate:{ 
            path: 'author'
        }
    }).populate('author')
    if(!campground){
        req.flash('error','Campground Not Found !!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}))

router.put('/:id',isLoggedIn,isAuthor, ValidateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if(!campground){
        req.flash('error','Campground Not Found !!')
        return res.redirect('/campgrounds')
    }
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    req.flash('success','Successfully edited the campground')
    res.redirect(`/campgrounds/${camp._id}`)
}))

router.delete('/:id', isLoggedIn,isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndDelete(id,{new:true})
    if(!campground){
        req.flash('error','Campground Not Found !!')
        return res.redirect('/campgrounds')
    }
    req.flash('success','Successfully deleted the campground')
    res.redirect('/campgrounds')
}))

router.get('/:id/edit',isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if(!campground){
        req.flash('error','Campground Not Found !!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground });
}))

module.exports = router