const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const users = require('../services/users');
const passportService = require('./auth');
const Validator = require('jsonschema').Validator;
const userSchema = require('../schemas/userSchema.json');
const secretJWT = process.env.secretJwt;



function checkSchema(req, res, next)
{
  try {
    const validate = new Validator();
    const validateResult = validate.validate(req.body, userSchema);
    if(validateResult.errors.length > 0) {
      validateResult.errors.status = 400;
      next(validateResult.errors);
    }
  }
  catch(error) {
    error.status = 400;
    next(error);
  }
  next();
}

router.post('', checkSchema, async (req, res) => {
  const hashedPassword = bcrypt.hashSync(req.body.password, 6);

  try {
    const newUser = await users.createNew({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      location: req.body.location,
      birth_date: req.body.birth_date
    });

    res.status(201).json({
      userId: newUser.user_id
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      reason: error
     
    });
  }
});

router.get('/login', passportService.authenticate('basic', { session: false }), async (req, res) => {
  console.log(req.user);
  const payload = {
    user : {
      id: req.user.user_id
    }
  };

  const options = {
    expiresIn: '60m'
  }

  /* Sign the token with payload, key and options.
     Detailed documentation of the signing here:
     https://github.com/auth0/node-jsonwebtoken#readme */
  const token = jwt.sign(payload, secretJWT, options);

  return res.json({ jwt: token });
});

//edit currently logged in user. 
router.put(
  '/',
  passportService.authenticate('jwt', { session: false }),
  async (req, res) => {
 
    try {
      const result = await users.modify({
        id: req.user.id,
        username: req.body.username,
        email: req.body.email
      });

      if(result.changes == 0) {
        res.status(400).json({ reason: "User not found" });
      }
      else {
        res.status(200).send("User modified");
      }
    } catch (error) {
        res.status(400).json({
        reason: error
      });
    }
});

//get some users information by id
router.get('/:id',
  passportService.authenticate('jwt', { session: false }),
  async (req, res) => {
   // console.log("logged in users id: " + req.user.id);
    try {
      const user = await users.getUserById(req.params.id);
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({
        reason: error
      });
    }

  return res.json();
});

//delete currently logged in user 
router.delete(
  '/',
  passportService.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const result = await users.deleteById(req.user.id);

      if(result == false) {
        res.status(404).send("User not found");
      }
      else {
        res.status(200).send("User deleted");
      }

    } catch (error) {
      res.status(400).json({
        reason: error
      });
    }
})

module.exports = router;