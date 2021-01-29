const express = require('express');
const router = express.Router();
const db = require('../db/index');
const bcrypt = require('bcrypt');
const passport = require('passport');
const passportHttp = require('passport-http');


passport.use(new passportHttp.BasicStrategy((email, password, done) => {
  db.query('SELECT * FROM users WHERE email=$1', [email])
    .then(user => {

      if (user.rows.length === 0) return done(null, false);

      const validPassword = bcrypt.compareSync(password, user.rows[0].password);
      if (!validPassword) return done(null, false);

      done(null, user.rows);
    })
})
);

// login a user
router.post('/', (req, res, next) => {
  passport.authenticate('basic', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).send('Invalid email or password.');

    const { user_id, name, email } = user[0];
    const userInfo = {
      user_id,
      name,
      email
    }

    res.send(userInfo);
  })(req, res, next);
});

module.exports = router;