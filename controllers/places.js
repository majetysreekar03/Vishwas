const Company = require('../models/company');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mbxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mbxToken });



module.exports.showAll = async (req, res) => {
    const all = await Company.find().populate('owner').populate({
        path: 'reviews',
        populate: {
            path: 'author' // populate author of each review
        }
    });

    res.render('list', { all, req: req });
};


module.exports.addPlaceForm = (req, res) => {
    const name = "";
    const location = "";
    const description = "";
    const category = "";
    const contact = 0;
    res.render('addPlace', { name, description, location, category, contact });
};


module.exports.addPlaceDB = async (req, res) => {
    const { name, description, location, category, contact } = req.body;
    if (name.trim() !== "" && description.trim() !== "" && location.trim() !== "" && contact>=1000000000 && contact<=9999999999) {

        try {
            const geoData = await geocoder.forwardGeocode({
                query: req.body.location,
                limit: 1
            }).send();
            const newCompany = new Company({ name: name.trim(), description: description.trim(), location: location.trim(), category, contact });
            newCompany.owner = req.user.id;
            newCompany.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
            newCompany.geometry = geoData.body.features[0].geometry;
            await newCompany.save();
            req.flash('success', 'Thanks for registering your place with us...!');
            res.redirect('/showAll');
        }
        catch (e) {
            if (e.message == `Cannot read property 'geometry' of undefined`) {
                req.flash('error', 'Please enter a valid location. Try Again');
            } else req.flash('error', e.message);

            res.redirect('/campgrounds/new');
        }

    }

    else {
        // console.log("please fill all fields");
        req.flash('error', 'Please fill all the fields.');
        res.render('addPlace', { name: name.trim(), description: description.trim(), location: location.trim(), contact, category });
    }

};


module.exports.updateForm = async (req, res) => {
    const { id } = req.params;
    const place = await Company.findById(id);

    if (place !== null) {
        res.render('update', { place });
    }
    else {
        req.flash('error', 'Place might be deleted or not yet made.');
        res.redirect('/home');
    }

};


module.exports.updateInDB = async (req, res) => {
    const { name, description, location, category, contact } = req.body;
    // console.log(req.body);

    if (name.trim() !== "" && description.trim() !== "" && location.trim() !== "" && contact>=1000000000 && contact<=9999999999) {
        const place = await Company.findByIdAndUpdate(req.params.id, { name: name.trim(), description: description.trim(), category, contact }, { new: true });


        try {
            const geoData = await geocoder.forwardGeocode({
                query: req.body.location,
                limit: 1
            }).send()
            place.geometry = geoData.body.features[0].geometry; // updating 'geometry' of place.


            const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
            place.images.push(...imgs);
            place.location = location;
            await place.save();

            if (req.body.deleteImages) {
                for (let filename of req.body.deleteImages) {
                    await cloudinary.uploader.destroy(filename);
                }
                await place.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
            }

            req.flash('success', 'Successfully updated!!');
            res.redirect(`/show/${req.params.id}`);

        } catch (e) {
            if (e.message == `Cannot read property 'geometry' of undefined`) {
                req.flash('error', 'Please enter a valid location. Try Again');
            } else req.flash('error', e.message);

            const { id } = req.params;
            const place = await Company.findById(id);
            res.render('update', { place });
        }


    }
    else {
        const { id } = req.params;
        const place = await Company.findById(id);
        if (place !== null) {
            req.flash('error', 'Fill all the fields');
            res.render('update', { place });
        }
        else {
            req.flash('error', 'Place might be deleted or not yet made.');
            res.redirect('/home');
        }
    }

};



module.exports.deletePlace = async (req, res) => {
    const { id } = req.params;
    await Company.findByIdAndDelete(id);
    // console.log("deleted");
    req.flash('success', 'Deleted the place');
    res.redirect('/showAll');
};


module.exports.showParticularPlace = async (req, res) => {
    const { id } = req.params;
    const place = await Company.findById(id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author' // populate author of each review
            }
        })
        .populate('owner');

    var avgRating = 0;

    if (place.reviews.length > 0) {
        place.reviews.forEach((obj) => {
            avgRating += obj.rating;
        });
        avgRating /= place.reviews.length;
    }
    else avgRating = -1;

    if (place !== null) {
        res.render('show', { place, avgRating });
    }
    else {
        req.flash('error', 'Place might be deleted or not yet made.');
        res.redirect('/home');
    }
};


