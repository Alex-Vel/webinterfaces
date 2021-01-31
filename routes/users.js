const express = require('express');
const router = express.Router();
const db = require('../db/index');
const bcrypt = require('bcrypt');
const passportService = require('./auth');
const secretJWT = require('../jwt-key.json');
const jwt = require('jsonwebtoken');

// app.post("/users", (req, res) => {
//   const ajv = new Ajv();
//   const validate = ajv.compile(userSchemaDocument);
//   const valid = validate(req.body);
//   if (valid == true) {
//     //new user create
//     //console.log(req.body)
//     res.status(200);
//     res.send("User created");
//   } else {
//     res.status(400);
//     res.send("Problem with user creation");
//   }
// });

//login a user

router.get('/login', passportService.authenticate('basic', { session: false }), async (req, res) => {

  const payload = {
    user : {
      id: req.user.id
    }
  };

  const options = {
    expiresIn: '1m'
  }

  const token = jwt.sign(payload, secretJWT.secretKey, options);

  return res.json({ jwt: token });
});

// register a user
router.post("/", (req, res) => {
    const { username, email, password, location, address, birth_date } = req.body;
    
    console.log(req.body);
    const hashedPassword = bcrypt.hashSync(password, 8);
    const newUser = [
      username,
      email,
      hashedPassword,
      address,
      birth_date,
      location,
    ];
  
    console.log(req.body);
  
    db.query("SELECT username FROM users WHERE username= $1 ", [username])
      .then((username) => {
        if (username.rows.length > 0)
          return res.status(400).send("username already exists");
  
        db.query(
          "INSERT INTO users (username, email, password, address, birth_date, location) VALUES ($1, $2, $3, $4, $5, $6) ",
          newUser
        )
          .then(() => res.sendStatus(201))
          .catch((err) => {
            res.sendStatus(500);
          });
      })
      .catch((err) => {
        res.sendStatus(500);
      });
  });
  
// get user by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
  
    db.query('SELECT user_id, username, email FROM users WHERE user_id = $1 ', [id])
      .then(user => {
        if (user.rows.length > 0) {
          console.log(user.rows);
          const { user_id, username, email } = user.rows[0];
          const userInfo = {
            user_id,
            username,
            email
          }
  
          res.send(userInfo)
        }
      })
      .catch(err => {
        res.sendStatus(500);
      });
  })
//
  
  module.exports = router;