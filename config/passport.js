const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const User = require("../models/User");

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://localhost:3000/auth/google/callback",
    passReqToCallback: true
},
    async function (request, accessToken, refreshToken, profile, done) {
        try {
            let user = await User.findOne({
                $or: [
                    { googleId: profile.id },
                    { userName: profile.email }
                ]
            });

            if (!user) {
                user = new User({
                    googleId: profile.id,
                    userName: profile.email,
                    password: "google-auth-user" // Placeholder for OAuth users
                });
                await user.save();
            } else if (!user.googleId) {
                user.googleId = profile.id;
                await user.save();
            }
            
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));