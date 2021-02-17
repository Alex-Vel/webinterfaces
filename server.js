const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const bodyParser=require("body-parser");
const app = express();
const port = process.env.PORT || 4000;

//init routes
const users = require("./routes/users");
const postings = require("./routes/postings");
const bodyParser = require("body-parser");

app.use(express.static("public"));
app.use(express.json());
app.use(cors());
app.use(bodyParser);

//use the two routes
app.use("/users", users);
app.use("/postings", postings);

app.get("/", (req, res) => {
  res.status(200);
  res.send("This is the API for an online market");
});

//initial server instance is null
let serverInstance = null;

//assign an instance to the serverinstance var
module.exports = {
  start: function (env) {
    serverInstance = app.listen(port, () =>
      //console log server start if all is good
      console.log(`Server is up and listening on ${port}...` + env)
    );
  },
  close: function () {
    //close server for end of tests
    serverInstance.close();
  },
};
