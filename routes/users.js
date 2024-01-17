const express = require('express')
const router = express.Router({mergeParams:true})
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const User = require('../models/user');
const users = require('../controllers/users.js')
const { isLoggedIn, storeReturnTo  } = require('../middleware.js')

router.route('/register')
    .get( users.registerForm)
    .post( catchAsync(users.register))

router.route('/login')
    .get(users.loginForm)
    .post( storeReturnTo ,passport.authenticate('local',{failureFlash:true , failureRedirect:'/login'}),users.login)

router.get('/logout', isLoggedIn, users.logout); 



module.exports = router