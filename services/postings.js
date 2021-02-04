const db = require("../db/index");
const { v4: uuidv4 } = require("uuid");


    //get posting by uuid
   async function getPostingByUuid (uuid){
      return new Promise((resolve, reject) => {
        db.query(
          "SELECT posting_id, title, description, location, shipping_method, price, categor, image_links FROM postings WHERE uuid = $1 ",
          [uuid],
          function (error, result) {
            if (result.rows.length < 1 || error != undefined) {
              reject("no postings");
            } else {
              resolve(result.rows);
            }
          }
        );
      });
    }

module.exports = {
  //get all postings by user id service
  getPostingsByUserId: async (user_id) => {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT title, description, location, shipping_method, price, category, image_links FROM postings WHERE user_id = $1 ",
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
      ).then(() => {
                console.log("getting posting by uuid");
                return getPostingByUuid(uuid);
              })
              .then((posting) => {resolve(posting);})
        .catch((error) => reject(error));
    });
  },

  //upload images to posting
  uploadImagesToPosting: async (posting) => {
    return new Promise((resolve, reject) => {
      db.query(
        " UPDATE postings SET image_links = $1 WHERE posting_id = $2 ",[
          posting.postingImages, posting.posting_id
        ]
      ).then((result) => {resolve(result.rowCount);})
        .catch((error) => reject(error));
    });
  },

  //get posting by uuid
  getPostingByUuid:getPostingByUuid,

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

  //delete a posting by its id, current user id required
  deletePostingById: async (user_id, posting_id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await db.query(
          "DELETE FROM postings WHERE user_id = $1 AND posting_id = $2 ",
          [user_id, posting_id]
        );
        console.log(result);
        if (result.rowCount > 0) {
          resolve("dude deleted",true);
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
            resolve("posting edited", true);
          } else {
            reject("editting posting error");
          }
        })
        .catch((error) => reject(error));
    });
  },
};
