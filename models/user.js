const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    //you can remove these since the Passport plugin will add those fields to the document
    // along with hashing & salting the password
    // username: {
    //     type: String,
    //     required: true,
    //     unique: true,
    // },
    // password: {
    //     type: String,
    //     required: true,
    // },
    firstname: {
        type: String,
        default: "",
    },
    lastname: {
        type: String,
        default: "",
    },
    //by default when a new user document's created the admin flag'll be set to false
    admin: {
        type: Boolean,
        default: false,
    },
});

//this plugin'll also provide us w/ other authentication-related methods on the schema like the authenticate method
userSchema.plugin(passportLocalMongoose);
//model created & exported in 1 line
module.exports = mongoose.model("User", userSchema);
