const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
const port = 4000;

//init routes
const users = require("./routes/users");
const postings = require("./routes/postings");

app.use(express.static("public"));
app.use(express.json());
app.use(cors());

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
    //close server for tests
    serverInstance.close();
  },
};
