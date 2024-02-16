const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const flash = require("connect-flash");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");


//sign up page get-route 
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

//sign up post-route
router.post("/signup", wrapAsync(async (req, res) => {

    try {
        let { username, email, password } = req.body;
        let newUser = new User({ username, email });
        const registerdUser = await User.register(newUser, password);
        console.log(registerdUser);
        req.flash("success", "User registerd Successfully");
        res.redirect("/listings");
    } catch (error) {
        req.flash("error", error.message);
        res.redirect("/signup");
    }
}));


//login page get-route
router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

//login page post-route
router.post("/login",
    passport.authenticate("local",
        {
            failureRedirect: "/login",
            failureFlash: true
        }),
    wrapAsync(async (req, res) => {
        req.flash("success", "Welcome back to JournyNest");
        res.redirect("/listings");
    }))



module.exports = router;