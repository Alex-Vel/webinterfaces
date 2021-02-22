const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const router = express.Router();
const postings = require("../services/postings");
const Validator = require("jsonschema").Validator;
const passportService = require("./auth");
const newPostingSchema = require("../schemas/newPostingSchema.json");

// const fileFilter = (req, file, cb) => {
//   if (
//     file.mimetype === "image/png" ||
//     file.mimetype === "image/jpg" ||
//     file.mimetype === "image/jpeg"
//   ) {
//     cb(null, true);
//   } else {
//     cb(new Error("File format should be PNG,JPG,JPEG"), false);
//   }
// };

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  folder: "", // give cloudinary folder where you want to store images
  allowedFormats: ["jpg", "png"],
});

let multerUpload = multer({ storage: storage });

cloudinary.config({
  cloud_name: process.env.CLOUD,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// const multerUpload = multer({
//   dest: "uploads/",
//   limits: { fileSize: 1000000 },
//   fileFilter: fileFilter,
// });

function schemaCheck(req, res, next) {
  try {
    const validate = new Validator();
    const validateResult = validate.validate(req.body, newPostingSchema);
    if (validateResult.errors.length > 0) {
      validateResult.errors.status = 400;
      next(validateResult.errors);
    }
  } catch (error) {
    error.status = 400;
    next(error);
  }
  next();
}

//get user specific postings
router.get(
  "/user/:user_id",
  passportService.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (Number.isInteger(parseInt(req.params.user_id)) == true) {
    try {
      console.log(req.params.user_id);
      let userPostings = await postings.getPostingsByUserId(req.params.user_id);

      res.status(200).json({
        postings: userPostings,
      });
    } catch (error) {
      res.status(400).json({
        reason: error,
      });
    }
  }
  else {
    res.status(400).json({ reason: "non valid user_id in cache" });
  }
}
);

//get postings by search params
router.get(
  "/search/",
  passportService.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      console.log(req.query);
      let userPostings = await postings.getPostingsBySearch(req.query);

      res.status(200).json({
        postings: userPostings,
      });
    } catch (error) {
      res.status(400).json({
        reason: error,
      });
    }
  }
);

// get posting by id
router.get("/:posting_id", async (req, res) => {
  if (Number.isInteger(parseInt(req.params.posting_id)) == true) {
    try {
      const posting = await postings.getPostingById(req.params.posting_id);
      res.status(200).json(posting);
    } catch (error) {
      res.status(404).json({
        reason: error,
      });
    }
  } else {
    res.status(400).json({ reason: "please provide valid posting id" });
  }
});

//create new posting
router.post(
  "",
  passportService.authenticate("jwt", { session: false }),
  schemaCheck,
  async (req, res) => {
    try {
      const newPosting = await postings.createNewPosting({
        user_id: req.user.id,
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        shipping_method: req.body.shipping_method,
        location: req.body.location,
        category: req.body.category,
        posting_config: req.body.posting_config,
      });
      res.status(201).json(newPosting);
    } catch (error) {
      res.status(400).json({
        reason: error,
      });
    }
  }
);

//upload images to new posting

// router.post(
//   "/images/:posting_id",
//   passportService.authenticate("jwt", { session: false }),
//   multerUpload.array("postingImages", 3),
//   async (req, res) => {
//     console.log(req.file);
//     res.status(201);
//     res.json(req.file);
//     }
// );

router.post(
  "/images/:posting_id",
  passportService.authenticate("jwt", { session: false }),
  multerUpload.single("images"),
  async function (req, res) {
    console.log(req.file);

    try {
      const result = await postings.uploadImagesToPosting({
        posting_id: req.params.posting_id,
        image_link: req.file.path,
      });
      res.status(201);
      res.json(req.params.posting_id);
    } catch (error) {
      res.status(404);
    }
  }
);

router.delete(
  "/:posting_id",
  passportService.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const result = await postings.deletePostingById(
        req.params.posting_id,
        req.user.id
      );
      res.status(200).send();
    } catch (error) {
      res.status(404).send();
    }
  }
);

router.put(
  "/:posting_id",
  passportService.authenticate("jwt", { session: false }),
  schemaCheck,
  async (req, res) => {
    try {
      //exctract jwt user id
      const result = await postings.updatePostingById(
        req.params.posting_id,
        req.body
      );

      res.status(200).send();
    } catch (error) {
      res.status(404).send();
    }
  }
);

module.exports = router;
