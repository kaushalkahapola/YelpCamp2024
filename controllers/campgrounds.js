const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    const camps = await Campground.find({})
    res.render('campgrounds/index', { camps })
}

module.exports.new = async (req, res) => {
    if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const camp = new Campground(req.body.campground)
    camp.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    camp.author = req.user._id
    await camp.save()
    req.flash('success','Successfully added a new campground')
    res.redirect(`/campgrounds/${camp._id}`)
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.show = async (req, res) => {
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
    // console.log(campground.images)
    res.render('campgrounds/show', { campground })
}

module.exports.edit = async (req, res) => {
    // console.log(req.body)
    const { id } = req.params
    const campground = await Campground.findById(id)
    if(!campground){
        req.flash('error','Campground Not Found !!')
        return res.redirect('/campgrounds')
    }
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    if (req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename)
        }
        await camp.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}})
    }
    const imgs= req.files.map(f => ({ url: f.path, filename: f.filename }));
    camp.images.push(...imgs)
    await camp.save()
    req.flash('success','Successfully edited the campground')
    res.redirect(`/campgrounds/${camp._id}`)
}

module.exports.delete = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndDelete(id,{new:true})
    if(!campground){
        req.flash('error','Campground Not Found !!')
        return res.redirect('/campgrounds')
    }

    req.flash('success','Successfully deleted the campground')
    res.redirect('/campgrounds')
}

module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if(!campground){
        req.flash('error','Campground Not Found !!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground });
}