const db = require("../db/index");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  //get all postings by user id service
  getPostingsByUserId: async (user_id) => {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT title, description, location, shipping_method, price, category FROM postings WHERE user_id = $1 ",
        [user_id],
        function (error, result) {
          console.log(result.rows);
          if (result.rows.length < 1 || error != undefined) {
            reject("no postings");
          } else {
            console.log(result.rows);
            resolve(result.rows);
          }
        }
      );
    });
  },
  //create new posting service
  createNewPosting: async (posting) => {
    const uuid = uuidv4();
    console.log(posting);
    return new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO postings (title, description, location, price, shipping_method, posting_config, category, user_id, uuid) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
        [
          posting.title,
          posting.description,
          posting.location,
          posting.price,
          posting.shipping_method,
          posting.posting_config,
          posting.category,
          posting.user_id,
          uuid,
        ]
      )
        .then((result) => {
          if (result.rowCount == 1) {
            resolve(true);
          } else {
            reject(false);
          }
        })
        .catch((error) => reject(error));
    });
  },

  //get posting by id
  getPostingById: async (posting_id) => {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT title, description, location, shipping_method, price, category FROM postings WHERE posting_id = $1 ",
        [posting_id],
        function (error, result) {
          console.log(result.rows);
          if (result.rows.length < 1 || error != undefined) {
            reject("no postings");
          } else {
            console.log(result.rows);
            resolve(result.rows);
          }
        }
      );
    });
  },
  deletePostingById: async (user_id, posting_id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await db.query(
          "DELETE FROM postings WHERE user_id = $1 AND posting_id = $2 ",
          [user_id, posting_id]
        );
        console.log(result);
        if (result.rowCount > 0) {
          resolve(true);
        } else {
          reject("no such posting");
        }
      } catch {
        reject(error);
      }
    });
  },
  updatePostingById: async (posting_id, updatedPosting) => {
    return new Promise((resolve, reject) => {
      return db
        .query(
          " UPDATE postings SET title = $1, description = $2, price = $3, location = $4, category = $5 WHERE posting_id = $6 "[
            (updatedPosting.title, updatedPosting.description, updatedPosting.price, updatedPosting.location, updatedPosting.category, posting_id)
          ]
        )
        .then((result) => {
          if (result.rowCount > 0) {
            resolve(true);
          } else {
            reject("editting posting error");
          }
        })
        .catch((error) => reject(error));
    });
  },
};
