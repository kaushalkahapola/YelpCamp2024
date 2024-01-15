const { text } = require('express')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const reviewSchema = new Schema({
    rating: Number,
    body: String
})

module.exports = mongoose.model('Review',reviewSchema)