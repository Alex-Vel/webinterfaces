const express = require('express');
const router = express.Router();
const postings = require('../services/postings');
const Validator = require('jsonschema').Validator;
const passportService = require('./auth');
const newPostingSchema = require('../schemas/newPostingSchema.json');

function schemaCheck(req, res, next)
{
  try {
    const validate = new Validator();
    const validateResult = validate.validate(req.body, newPostingSchema);
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

//get user specific postings
router.get( '/user/:user_id', 
//passportService.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      console.log(req.params.user_id);
      let userPostings = await postings.getPostingsByUserId(req.params.user_id);
     
      res.status(200).json({
        postings: userPostings
      });
    } catch (error) {
      res.status(400).json({
        reason: error
      }
      );
    }
});

// get posting by id
router.get('/:id', async (req, res) => {
    try {
      const posting = await postings.getPostingById(req.params.posting_id);
      if(posting === undefined) {
        res.status(404).send();
      }
      else {
        res.status(200).json(posting);
      }
    } catch (error) {
      res.status(400).json({
        reason: error
      });
    }
});

//create new posting
router.post(
  '',
  //passportService.authenticate('jwt', { session: false }),
  schemaCheck,
  async (req, res) => {

    try {
      const result = await postings.createNewPosting({
        user_id: req.body.user_id,
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        shipping_method: req.body.shipping_method,
        location: req.body.location,
        category: req.body.category,
        posting_config: req.body.posting_config
      });
      res.status(201).send();
    } catch (error) {
      res.status(400).json({
        reason: error
      });
    }
});

router.delete(
  '/:id',
  passportService.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      //extract jwt user id
      const result = await postings.deletePostingById(req.params.id, req.user.id);

      res.status(200).send();
    } catch (error) {
      res.status(404).send();
    }
});

router.put(
  '/:user_id',
  passportService.authenticate('jwt', { session: false }),
  schemaCheck,
  async (req, res) => {
    try {
      //exctract jwt user id
      const result = await postings.updatePostingById(req.params.user_id, req.body);

      res.status(200).send();
    } catch (error) {
      res.status(404).send();
    }

});

module.exports = router;