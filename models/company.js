const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Review = require('./review');
const GoogleUser = require('./googleuser');

const opt = { toJSON: { virtuals: true } };

const ImageSchema = new Schema(
  {
    url: String,
    filename: String
  }
)

ImageSchema.virtual('thumbnail').get(function () { // we name virtual as 'thumbnail'
  return this.url.replace('/upload', '/upload/w_210,h_200');  // modifies the url i.e. replace the '/upload' with 'upload/w_200'
})

const companySchema = new Schema({
  
  name: {
    type: String,
    required: true
  },

  location: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  category: {
    type: String,
    required: true
  },

  images: [ImageSchema],
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'GoogleUser',
    required: true
  },
  geometry: { // We will store 'geometry' in db, which is of format { "type" : "Point", "coordinates" : [ -122.5, 37.7 ] i.e. [longitude, latitude] } 
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  contact: {
    type: Number,
    min: 1000000000,
    max: 9999999999,
    required: true
  }

}, opt);


// FOR MAPS DISPLAYING THE COMPANY DETIALS IN CLUSTER
companySchema.virtual('properties.popUpMarkup').get(function () {
  return `
    <h5> <a href = "/show/${this._id}">${this.name} </a> </h5>
    <h6>${this.location}</h6>
    <p>${this.description.substring(0, 34)}...</p>
    `
})

// DELETING THE REVIEWS AFTER A COMPANY IS DELETED
companySchema.post('findOneAndDelete', async (doc) => {
  if (doc) {
    await Review.deleteMany({
      _id: { $in: doc.reviews }
    })
  }
})


module.exports = mongoose.model('Company', companySchema);
