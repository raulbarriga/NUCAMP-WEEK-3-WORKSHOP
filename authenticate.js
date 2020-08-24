const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user");
//for JWT
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken"); // used to create, sign, and verify tokens
//the JSWT config module
const config = require("./config.js");

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//for JWT
exports.getToken = function (user) {
    //3600 seconds is an hour, long enough to test the server
    //you can set this for longer, even days, if you ommit this it won't expire but it's not recommended
    return jwt.sign(user, config.secretKey, { expiresIn: 3600 });
};

const opts = {};
//specifies how the token should be extracted from the incoming request message
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
        console.log("JWT payload:", jwt_payload);
        User.findOne({ _id: jwt_payload._id }, (err, user) => {
            if (err) {
                return done(err, false);
            } else if (user) {
                //null as 1st argument means no error
                //passport uses this done method to access the user document & load info from it
                return done(null, user);
            } else {
                //this last else block means there was no error but no user document was found that matched what's in the token
                //null for no error but false for no user was found
                return done(null, false);

                //if you wanted you could set up code here to prompt to create a new user account
                //but we'll just keep it simple for now
            }
        });
    })
);

//jwt to say we want to use the JWT strategy & session: false means we're not using sessions
//exporting as verifyUser export will make it easier for us later on
exports.verifyUser = passport.authenticate("jwt", { session: false });

exports.verifyAdmin = function (req, res, next) {
    if (req.user.admin) {
        return next();
    } else {
        var err = new Error(
            "You are not authorized to perform this operation!"
        );
        err.status = 403;
        return next(err);
    }
};
