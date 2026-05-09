const { object } = require("joi");
const mongoose = require("mongoose");
const itemSchema = new mongoose.Schema({
    name: String,
    value: String
});

const userSchema = new mongoose.Schema({
    userName: { type: String, required: true, unique: true },
    password: { type: String, required: function () { return !this.googleId } },
    googleId: { type: String, unique: true, sparse: true },
    vault: [itemSchema]
});

module.exports = mongoose.model("User", userSchema);