const express = require("express");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const Ajv = require("ajv").default;

const app = express();
const port = 4000;

//routes
const users = require("./routes/users");
const postings = require("./routes/postings");

const imageUpload = require("./components/imageUpload");

const jsonSchemaDocument = require("./schemas/WeatherSchemaDocument.json");

app.use(express.static("public"));
app.use(express.json());
app.use(cors());

app.use("/fileUpload", imageUpload);

app.use("/users", users);
app.use("/postings", postings);

app.get("/", (req, res) => {
  res.status(200);
  res.send("Hello World!");
});

app.post("/test", (req, res) => {
  console.log(req.body);

  const ajv = new Ajv();
  const validate = ajv.compile(jsonSchemaDocument);
  const valid = validate(req.body);
  if (valid == true) {
    res.status(200);
    res.send("OK");
  } else {
    res.status(400);
    console.log(validate.errors);
    res.send(validate.errors.map((e) => e.message));
  }
});

let serverInstance = null;

module.exports = {
  start: function () {
    serverInstance = app.listen(port, () =>
      console.log(`Server is up and listening on ${port}...`)
    );
  },
  close: function () {
    serverInstance.close();
  },
};
