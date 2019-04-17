const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;

const mongoose = require("mongoose");
const User = mongoose.model("User");
const keys = require("./keys");

const opts = {};
opts.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

module.exports = passport =>
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      console.log("JWT payload", jwt_payload);
    })
  );
