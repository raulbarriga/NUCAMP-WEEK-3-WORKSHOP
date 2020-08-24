const express = require("express");
const User = require("../models/user");
const passport = require("passport");
//for JWT
const authenticate = require("../authenticate");
const usersRouter = express.Router();

/* GET users listing. */
usersRouter
    .route("/")
    .get(authenticate.verifyUser, authenticate.verifyAdmin, function(
        req,
        res,
        next
    ) {
        // res.send(req.user);
        User.find()
            .then((users) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(users);
            })
            .catch((err) => next(err));
    });

//********allow a new user to register on our website********
// router.post("/signup", (req, res, next) => {
//     //********************* */
//     //the first thing you want to do when a new user creates their accout:
//     //check to see if the new user doesn't already have an account
//     User.findOne({ username: req.body.username })
//         .then((user) => {
//             //if a user with a matching name's found
//             if (user) {
//                 const err = new Error(
//                     `User ${req.body.username} already exists!`
//                 );
//                 err.status = 403;
//                 return next(err);
//             } else {
//                 //was null/undefined/something other than user document
//                 //it means it's okay to create a new user document
//                 //notice we don't set the admin flag here so that they won't be able to set themselves as admins
//                 User.create({
//                     //create method returns a promise
//                     username: req.body.username,
//                     password: req.body.password,
//                 })
//                     .then((user) => {
//                         res.statusCode = 200;
//                         res.setHeader("Content-Type", "application/json");
//                         res.json({
//                             status: "Registration Successful!",
//                             user: user,
//                         });
//                     })
//                     .catch((err) => next(err));
//             }
//         })
//         //in case the findOne method returns an error (something went worng with the method)
//         .catch((err) => next(err));
// });

usersRouter.post("/signup", (req, res) => {
    User.register(
        new User({ username: req.body.username }),
        req.body.password,
        //if something went internally wrong with the server not the user
        (err, user) => {
            if (err) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.json({ err: err });
            } else {
                if (req.body.firstname) {
                    user.firstname = req.body.firstname;
                }
                if (req.body.lastname) {
                    user.lastname = req.body.lastname;
                }
                user.save((err) => {
                    if (err) {
                        res.statusCode = 500;
                        res.setHeader("Content-Type", "application/json");
                        res.json({ err: err });
                        return;
                    }
                    passport.authenticate("local")(req, res, () => {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json({
                            //res.json({}) takes care of sending the response as well
                            success: true,
                            status: "Registration Successful!",
                        });
                    });
                });
            }
        }
    );
});

//(req, res, next) is a middleware function
// router.post("/login", (req, res, next) => {
//     //check if user's already logged in/if we're already tracking an authenticated session for this user
//     //properties of req.session object is automatically filled in if the req headers contain a cookie w/ an
//     // existing session id
//     if (!req.session.user) {
//         //this if means the user's not logged in
//         const authHeader = req.headers.authorization;

//         if (!authHeader) {
//             const err = new Error("You are not authenticated!");
//             res.setHeader("WWW-Authenticate", "Basic");
//             err.status = 401;
//             return next(err);
//         }

//         const auth = Buffer.from(authHeader.split(" ")[1], "base64")
//             .toString()
//             .split(":");
//         const username = auth[0];
//         const password = auth[1];

//         //take the username & password the user's giving us & check it against the user documents from our db
//         User.findOne({ username: username })
//             //check the username field first since it's unique/seems like the best bet to check 1st
//             .then((user) => {
//                 if (!user) {
//                     //if username doesn't exist
//                     const err = new Error(`User ${username} does not exist!`);
//                     err.status = 401;
//                     return next(err);
//                 } else if (user.password !== password) {
//                     //***if the password is incorrect */
//                     //make sure to output a specific message saying it's the password that's wrong
//                     const err = new Error("Your password is incorrect!");
//                     err.status = 401;
//                     return next(err);
//                 } else if (
//                     //double check that BOTH the username AND password matches
//                     user.username === username &&
//                     user.password === password
//                 ) {
//                     //req.session.user = "authenticated"; is all you need to start tracking a session
//                     req.session.user = "authenticated";
//                     res.statusCode = 200;
//                     res.setHeader("Content-Type", "text/plain");
//                     //we've been inside a then block this whole time so we need to close it here
//                     res.end("You are authenticated!");
//                 }
//             })
//             .catch((err) => next(err));
//     } else {
//         res.statusCode = 200;
//         res.setHeader("Content-Type", "text/plain");
//         res.end("You are already authenticated!");
//     }
// });all this code is now commented out

//passport.authenticate will enable password authentication
usersRouter.post("/login", passport.authenticate("local"), (req, res) => {
    //adding this line for JWT
    const token = authenticate.getToken({ _id: req.user._id });

    //the passport.authenticate method'll handle logging in the user
    //thus you don't have to hardcode everything like in the previous commented out loggin post
    //if there were any errors, then passport would've already takes care of that for us
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");

    //adding a token property to the response client
    //after this all the subsequent requests from the client'll have a token in the header which we'll use to verify that the user has already logged in
    res.json({
        success: true,
        token: token,
        status: "You are successfully logged in!",
    });
});
//use get since the client's not submitting any info to the server like a username & password
usersRouter.get("/logout", (req, res, next) => {
    //it's just saying hey I'm out, you can stop tracking my session now
    //checking if the session exists
    if (req.session) {
        //deletes the user's file on the server-side
        //if the client tries to authenticate using that session's id, it won't be recognized
        //by the server as a valid session
        req.session.destroy();
        //to clear the cookie stored on the client
        res.clearCookie("session-id");
        res.redirect("/");
    } else {
        //if the user's requesting to log out w/o being logged in
        const err = new Error("You are not logged in!");
        err.status = 401;
        return next(err);
    }
});

module.exports = usersRouter;
