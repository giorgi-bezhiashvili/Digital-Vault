const { object } = require("joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userName: { type: String, required: true, unique: true },
    password: { type: String, required: function () { return !this.googleId } },
    googleId: { type: String, unique: true, sparse: true },
    vault: { type: Array, default: [] } 
});

module.exports = mongoose.model("User", userSchema);