const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    // useCreateIndex: true,  // Correct option name
    useUnifiedTopology: true
});

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error'))
db.once('open', () => {
    console.log("Database Connected")
})

const sample = array => array[Math.floor(Math.random() * array.length)]


const seedDB = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < 50; i++) {
        const price = Math.floor(Math.random()*20 ) +10;
        // const randomImageNumber = Math.floor(Math.random() * 1000); // or any other suitable range
        const camp = new Campground({
            location: `${sample(cities).city}, ${sample(cities).state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: `http://source.unsplash.com/collection/484351`,
            // image: `http://source.unsplash.com/collection/484351/?sig=${randomImageNumber}`,
            price: price,
            description:   'Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim aliquam recusandae vitae, exercitationem placeat magnam fugit doloribus quo necessitatibus error provident alias voluptas ipsa quae mollitia debitis vero eum quam?'
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
