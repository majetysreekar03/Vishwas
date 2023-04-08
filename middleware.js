const Company = require("./models/company");
const Review = require('./models/review');

const isLoggedIn = (req, res, next) => {
    if(req.user) next();
    else { // not logged in
        // console.log("Login first");
        req.flash('primary', 'You need to be logged in!!');
        res.redirect('/home');
    }
}
module.exports.isLoggedIn = isLoggedIn; 

class ExpressError extends Error {
    constructor(message, status) {
        super();
        this.message = message;
        this.status = status || 404;
    }
}
module.exports.ExpressError = ExpressError;

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const place = await Company.findById(id);
    if ( place !== null &&  place.owner.equals(req.user._id)){
        next();
    } else {
        req.flash('error', 'Action Prohibited as it belongs to someone else!');
        // console.log("NOT ALLOWEDD");
        return res.redirect(`/showAll`);
    }
}


module.exports.catchAsyncError = (fn) => {
    return (req, res, next) => {
        fn(req,res,next).catch(e => next(e));
    }
}

module.exports.isReviewOwner = async (req, res, next) => {
    const { re_id } = req.params;
    const rev = await Review.findById(re_id);
    if(rev!=null && rev.author.equals(req.user.id)){
        next();
    }
    else{
        req.flash('error', 'Action Prohibited as it belongs to someone else!');
        // console.log("NOT ALLOWEDD");
        return res.redirect(`/showAll`);
    }
}