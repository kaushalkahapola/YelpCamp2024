if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}


const { log } = require('console');
const express = require('express');
const session = require('express-session')
const flash = require('connect-flash')
const path = require('path');
const ejsMate = require('ejs-mate')
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const ExpressError = require('./utils/ExpressError');
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user.js')

const campgroundRoutes = require('./routes/campgrounds.js')
const reviewsRoutes = require('./routes/reviews.js')
const userRoutes = require('./routes/users.js')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
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
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req,res,next)=>{
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})


app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/reviews',reviewsRoutes)
app.use('/',userRoutes)


app.get('/', (req, res) => {
    res.render('home')
})

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