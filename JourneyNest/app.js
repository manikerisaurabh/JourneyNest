const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");


const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpessError");
const { listingSchema } = require("./schema");
const Review = require("./models/review");
const { reviewSchema } = require("./schema");
const review = require("./models/review");


const MONGO_URL = "mongodb://127.0.0.1:27017/journeynest"
async function main() {
    await mongoose.connect(MONGO_URL);
}
app.use(cors());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

main()
    .then(() => {
        console.log("CONNECCTED TO DB");
    })
    .catch(err => {
        console.log("ERROR DURING DB CONNECTION : " + err);
    })


app.get("/", (req, res) => {
    res.send("this is home route");
});

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

//validating the review coming for the post
const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

//index route
app.get("/listings", wrapAsync(async (req, res, next) => {

    const allListing = await Listing.find()
    res.render("listings/index.ejs", { allListing });
    //res.send({ allListing }
}));

//new listing
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs")
});

//show route
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const list = await Listing.findById(id).populate("reviews");
    const reviews = list.reviews;
    console.log("these are the revies : " + reviews)

    res.render("listings/show.ejs", { list })
}));

//add new listing into db 
app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {

    let newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

//edit route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

//update edited info into database
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

//delete route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings")
}));

//review route
//post
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
    const { id } = req.params;
    let listing = await Listing.findById(id);
    let newReview = new Review(req.body.review)
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${id}`);
}));




app.all("*", (req, res, next) => {
    next(new ExpressError(404, "page not found"))
})
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "something went wrong" } = err;
    //res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", { err })
})


app.listen(8080, () => {
    console.log("SERVER IS LISTENING ON PORT 8080");
});