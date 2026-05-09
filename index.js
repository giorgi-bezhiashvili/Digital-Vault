require("dotenv").config();
const express = require("express");
const app = express()
const mongoose = require("mongoose");
const passport = require("passport");
const helmet = require("helmet");
const hpp = require("hpp");
const sanitize = require("mongo-sanitize");
const https = require('https');
const fs = require('fs');
const addingRoute = require('./routes/adding'); // ან რაც ქვია ამ ფაილს
// Config imports
require("./config/passport"); 
const authRoutes = require("./routes/auth");


// Security Middleware
app.use(helmet({ xPoweredBy: false, contentSecurityPolicy: false }));
app.use(express.json({ limit: "10kb" }));
app.use((req, res, next) => { if (req.body) req.body = sanitize(req.body); next(); });
app.use(hpp());
app.use(passport.initialize());

// Routes
app.use('/api', addingRoute);
app.use("/auth", authRoutes.router);

// Server Setup
const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        https.createServer(options, app).listen(3000, () => {
            console.log('Server is spinning on https://localhost:3000');
        });
    });