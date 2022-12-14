const passport = require('passport');
const googleStrategy = require('passport-google-oauth').OAuth2Strategy;
const crypto = require('crypto');
const User = require('../models/users');


//tell passport to use a new strategy for google login
passport.use(new googleStrategy({
    clientID: "501020567489-1tsflv2s7456iovsdfb9n63d56e12ogn.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "http://localhost:8000/users/auth/google/callback",
},

function(accessToken, refreshToken, profile, done){
    //find a user
    User.findOne({email: profile.emails[0].value}).exec(function(err, user){
        if(err){console.log('error in google strategy-passport', err);
        return ;
    }

    console.log(profile);

    if(user){
        //if found, set this user as req.user
        return done(null, user);
    }else{
        //if not found, create the user and set it as req.user
        User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: crypto.randomBytes(20).toString('hex')     //To create a random password
        }, function(err, user){
            if(err){console.log('error in creating user google strategy-passport',err); return;}
            
            return done(null, user);
        });
    }
    })
}

));


module.exports = passport;
