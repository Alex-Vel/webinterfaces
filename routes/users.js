const express = require('express');
const router = express.Router();
const db = require('../db/index');
const bcrypt = require('bcrypt');


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

// register a user
router.post("/", (req, res) => {
    const { username, email, password, location, address, birth_date } = req.body;
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
  
    db.query("SELECT email FROM users WHERE email= $1 ", [email])
      .then((email) => {
        if (email.rows.length > 0)
          return res.status(400).send("Email already exists");
  
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