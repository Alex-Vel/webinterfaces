const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require("bcrypt");
const db = require("../db/index");

const secretJWT = process.env.secretJwt;




passport.use(new BasicStrategy(
  async function(username, password, done) {

    try {
      const user = await db.query('SELECT * FROM users WHERE username=$1', [username]);
     
      if(user == undefined) {
        // Username not found
        console.log("no such username")
        return done(null, false);
      }
      console.log("user exists")
      /* Verify password match */
      if(bcrypt.compareSync(password, user.rows[0].password) == false) {
        console.log("password doesnt match")
        // Password does not match
        return done(null, false);
      }
      console.log("password ok")
      return done(null, user.rows[0]);
      
    } catch (error) {
      console.log("error")
      return done(null, false);
      
    }
  }
));

let jwtOptions = {};

/* Configure the passport-jwt module to expect JWT
   in headers from Authorization field as Bearer token */
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

/* This is the secret signing key.
   You should NEVER store it in code  */
jwtOptions.secretOrKey = secretJWT;

passport.use(
  new JwtStrategy(jwtOptions, function (jwt_payload, done) {
      console.log("payload is..: " + jwt_payload.user.id);
      done(null, jwt_payload.user);
    
  }));




module.exports = passport;
