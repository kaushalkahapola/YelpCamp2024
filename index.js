const { log } = require('console');
const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate')
const catchAsync = require('./utils/catchAsync')
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const Campground = require('./models/campground');

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


app.get('/', (req, res) => {
    res.render('home')
})

app.get('/makecampground', async (req, res) => {
    const camp = new Campground({
        title: 'My Backyard',
        description: 'cheap camping'
    })
    await camp.save()
    res.send(camp)
})

app.get('/campgrounds', catchAsync( async (req, res) => {
    const camps = await Campground.find({})
    res.render('campgrounds/index', { camps })
}))

app.post('/campgrounds', catchAsync( async (req, res) => {
    const {title , location , price, description, image} = req.body
    const camp = new Campground({title , location , price, description, image} )
    await camp.save()
    res.redirect(`/campgrounds/${camp._id}`)
}))

app.put('/campgrounds/:id', catchAsync(async (req, res) => {
    const {title,location,price,description,image} = req.body
    await Campground.findByIdAndUpdate(req.params.id, {title,location,price,description,image})
    res.redirect(`/campgrounds/${req.params.id}`)
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const {title,location,price,description,image} = req.body
    await Campground.findByIdAndUpdate(req.params.id, {title,location,price,description,image})
    res.redirect(`/campgrounds/${req.params.id}`)
}))

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

app.get('/campgrounds/:id' , catchAsync( async (req, res) => {
    const {id} = req.params
    const camp = await Campground.findById(id)
    res.render('campgrounds/show', {camp})
}))

app.delete('/campgrounds/:id', catchAsync( async (req,res) =>{
    const {id} = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}))

app.use((err,req,res,next)=>{
    res.send("oh boy something went rong")
})


app.listen(8000, () => {
    log("Running on PORT 8000")
})