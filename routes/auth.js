const express = require('express');
const router = express.Router();
const db = require('../db/index');
const bcrypt = require('bcrypt');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt;
const jwtSecretKey = require('./jwt-key.json');


//JWT auths


let options = {}

options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

options.secretOrKey = jwtSecretKey.secretKey;

passport.use(new JwtStrategy(options, function(jwt_payload, done) {
  console.log("Processing JWT payload for token content:");
  console.log(jwt_payload);

   done(null, jwt_payload.user);

}));


app.get(
  '/jwtProtectedResource',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    console.log("jwt");
    res.json(
      {
        status: "Successfully accessed protected resource with JWT",
        user: req.user
      }
    );
  }
);


app.get(
  '/loginForJWT',
  passport.authenticate('basic', { session: false }),
  (req, res) => {
    const body = {
      id: req.user.id,
      email : req.user.email
    };

    const payload = {
      user : body
    };

    const options = {
      expiresIn: '1d'
    }


    const token = jwt.sign(payload, jwtSecretKey.secretKey, options);

    return res.json({ token });
})

module.exports = router;