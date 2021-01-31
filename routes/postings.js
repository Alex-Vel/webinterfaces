const express = require("express");
const router = express.Router({ mergeParams: true });
const db = require("../db/index");
const { v4: uuidv4 } = require("uuid");
const passportService = require('./auth');
const jwt = require('jsonwebtoken');

// get postings for user
router.get("/:id", (req, res) => {
  const user_id = req.params.id;

  db.query("SELECT * FROM postings WHERE user_id=($1)", [user_id])
    .then((postings) => {
      res.send(postings.rows);
    })
    .catch((err) => {
      console.log("get postings error ", err);
      res.sendStatus(500);
    });
});

// get posting by schedule uuid

router.get("/", (req, res) => {
  const uuid = req.params.uuid;

  db.query("SELECT * FROM postings WHERE uuid=($1)", [uuid])
    .then((postings) => {
      res.send(postings.rows);
    })
    .catch((err) => {
      console.log("get posting error ", err);
      res.sendStatus(500);
    });
});

// create a schedule for a user
router.post("/", (req, res) => {
  console.log(req.body);
  const { title, description, user_id, posting_config, location, category } = req.body;
  const uuid = uuidv4();
  const newPosting = [title, description, uuid, user_id, posting_config, location, category];

  db.query(
    "INSERT INTO schedules (title, description, uuid, user_id, posting_config, location, category) VALUES ($1, $2, $3, $4, $5, $6, $7) ",
    newPosting
  )
    .then(() =>
      db
        .query("SELECT * FROM postings WHERE uuid=($1)", [uuid])
        .then((result) => res.send(result.rows))
    )

    .catch((err) => {
      console.log("Create new posting error ", err);
      res.sendStatus(500);
    });
});

//delete a schedule

router.delete("/:id", (req, res) => {
  console.log(req.params);
  const schedule_id = req.params.id;

  db.query("DELETE FROM schedules WHERE schedule_id=($1)", [schedule_id])

    .then(() => res.sendStatus(200))
    .catch((err) => {
      console.log("Delete schedule error ", err);
      res.sendStatus(500);
    });
});

// edit a schedule title and description

router.put("/:id", (req, res) => {
  console.log(req.body);
  const schedule_id = req.params.id;
  const { title, description } = req.body;
  const editSchedule = [title, description, schedule_id];
  console.log(editSchedule);
  db.query(
    "UPDATE schedules SET title=($1), description=($2) WHERE schedule_id=($3)",
    editSchedule
  )
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      console.log("edit schedule error ", err);
      res.sendStatus(500);
    });
});

module.exports = router;
