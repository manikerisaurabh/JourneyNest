const express = require("express");
const router = express.Router();
const app = express();

const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpessError.js");
const { listingSchema } = require("../schema.js");


//validating the data coming from cliet with the help of joi package
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg)
    } else {
        next();
    }
}

//index route
router.get("/", wrapAsync(async (req, res, next) => {
    const allListing = await Listing.find()
    res.render("listings/index.ejs", { allListing });
    //res.send({ allListing }
}));

//new listing
router.get("/new", (req, res) => {
    res.render("listings/new.ejs")
});

//show route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const list = await Listing.findById(id).populate("reviews");

    res.render("listings/show.ejs", { list })
}));

//add new listing into db 
router.post("/", validateListing, wrapAsync(async (req, res, next) => {

    let newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

//edit route
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

//update edited info into database
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

//delete route
router.delete("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings")
}));


module.exports = router;