const express = require('express')
const router = express.Router({mergeParams:true})
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const User = require('../models/user');
const { isLoggedIn, storeReturnTo  } = require('../middleware.js')

router.get('/register', (req,res)=>{
    res.render('users/register')
})

router.post('/register', catchAsync(async (req,res)=>{
    try{
    const {username,email,password} = req.body
    const user = new User({ email, username })
    const newUser = await User.register(user, password)
    req.login(newUser,err =>{
        if (err) return next(err)
        req.flash('success', 'Welcome to Yelp Camp')
        res.redirect('/campgrounds')
    })
    }catch(e){
        req.flash('error',e.message)
        res.redirect('/register')
    }
}))

router.get('/login',(req,res)=>{
    res.render('users/login')
})
router.post('/login', storeReturnTo ,passport.authenticate('local',{failureFlash:true , failureRedirect:'/login'}),(req,res)=>{
    req.flash('success','Welcome back !!')
    const redirectUrl = res.locals.returnTo || '/campgrounds'
    res.redirect(redirectUrl)
})

router.get('/logout', isLoggedIn, (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/login');
    });
}); 



module.exports = router