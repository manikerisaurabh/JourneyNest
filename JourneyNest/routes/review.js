const express = require("express");
const router = express.Router({ mergeParams: true });


const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const Review = require("../models/review");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");




//post
router.post("/",
    validateReview,
    isLoggedIn,
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        let listing = await Listing.findById(id);
        let newReview = new Review(req.body.review)
        newReview.author = req.user._id;
        listing.reviews.push(newReview);
        console.log(newReview)
        await newReview.save();
        await listing.save();
        req.flash("success", "New Review Created!");
        res.redirect(`/listings/${id}`);
    }));

//delete review
router.delete(
    "/:reviewID",
    isLoggedIn,
    isReviewAuthor,
    async (req, res) => {
        console.log("delete review page")
        const { id, reviewID } = req.params;
        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewID } });
        await Review.findByIdAndDelete(reviewID);
        req.flash("success", "Review Deleted!");
        res.redirect(`/listings/${id}`);
    })

module.exports = router;