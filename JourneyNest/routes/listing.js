const express = require("express");
const router = express.Router();
const app = express();

const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listing.js");

//index route
router.get("/", wrapAsync(listingController.index));

//new listing
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs")
});

//show route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const list = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            },
        })
        .populate("owner");
    if (!list) {
        req.flash("error", "Listing you requested does not exits!");
        res.redirect("/listings");
    }
    console.log(list);
    res.render("listings/show.ejs", { list })
}));

//add new listing into db 
router.post("/", isLoggedIn, validateListing, wrapAsync(async (req, res, next) => {
    let newListing = new Listing(req.body.listing);
    console.log(req.user);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}));

//edit route
router.get("/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing you requested does not exits!");
            res.redirect("/listings");
        }
        res.render("listings/edit.ejs", { listing });
    }));

//update edited info into database
router.put("/:id",
    isLoggedIn,
    isOwner,
    validateListing,
    wrapAsync(async (req, res) => {
        let { id } = req.params

        await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        req.flash("success", "Listing Updated!");
        res.redirect(`/listings/${id}`);
    }));

//delete route
router.delete("/:id",
    isLoggedIn,
    isOwner,
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        await Listing.findByIdAndDelete(id);
        req.flash("success", "Listing Deleted!");
        res.redirect("/listings")
    }));


module.exports = router;