const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        filename: String,
        url: {
            type: String,
            default: "https://unsplash.com/photos/blue-body-of-water-in-front-of-building-near-trees-during-nighttime-M7GddPqJowg",
            set: (v) => v === "" ? "https://unsplash.com/photos/blue-body-of-water-in-front-of-building-near-trees-during-nighttime-M7GddPqJowg" : v,
        }
    },
    price: Number,
    location: String,
    country: String,
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    }]
});

const listing = mongoose.model("Listing", listingSchema);
module.exports = listing;