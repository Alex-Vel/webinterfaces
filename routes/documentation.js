const express = require('express');
const router = express.Router();
const docwebsite = require("../html/documentation.html");

router.get("/", (req, res) => {
    res.status(200);
    res.send(docwebsite);
  });
  