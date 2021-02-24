const db = require("../db/index");
const { v4: uuidv4 } = require("uuid");


    //get posting by uuid
   async function getPostingByUuid (uuid){
      return new Promise((resolve, reject) => {
        db.query(
          "SELECT posting_id, title, description, location, shipping_method, price, category, image_link FROM postings WHERE uuid = $1 ",
          [uuid],
          function (error, result) {
            if (result.rows[0].length < 1 || error != undefined) {
              reject("no postings");
            } else {
              resolve(result.rows[0]);
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
        "SELECT posting_id, title, description, location, shipping_method, price, category, image_link FROM postings WHERE user_id = $1 ",
        [user_id],
        function (error, result) {
          if (result.rows.length < 1 || error != undefined) {
            reject("no postings");
          } else {
         //   console.log(result.rows);
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

  //upload images paths to posting
  uploadImagesToPosting: async (posting) => {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await db
          .query(
            "UPDATE postings SET image_link = $1 WHERE posting_id = $2 " ,
            [posting.image_link, posting.posting_id]
          );
        if (result.rowCount > 0) {
        
          resolve("image uploaded", true);
        } else {
          reject("image posting error");
        }
      } catch (error) {
        console.log(error);
        return reject(error);
      }
    });
    },

  //get posting by uuid
  getPostingByUuid:getPostingByUuid,

  //get posting by id
  getPostingById: async (posting_id) => {
    return new Promise((resolve, reject) => {
      console.log('getting posting with id.. ' + posting_id)
      db.query(
        "SELECT posting_id, title, description, location, shipping_method, price, category, image_link FROM postings WHERE posting_id = $1 ",
        [posting_id],
        function (error, result) {
          if (result.rows[0] == undefined || error != undefined) {
            reject("no such posting");
          } else {
            console.log(result.rows);
            resolve(result.rows[0]);
          }
        }
      );
    });
  },

  getFreshPostings: async () => {
  let freshPostings =[];
    return new Promise((resolve, reject) => {
      console.log('getting fresh postings');
      db.query(
        "SELECT posting_id, title, description, location, shipping_method, price, category, image_link, create_date FROM postings ORDER BY create_date DESC ",
        function (error, result) {
          if (result.rows[0] == undefined || error != undefined) {
            reject("no such posting");
          } else {

            for(let i = 0; i<5; i++)
            {
              if(result.rows[i] != undefined)
              {
                freshPostings.push(result.rows[i]);
              }

            }

            console.log(result.rows);
            resolve(
              freshPostings
             // result.rows[0]
              
              );
          }
        }
      );
    });
  },

    //get posting by search
    getPostingBySearch: async (searchParams) => {
      if(searchParams.location && !searchParams.category)
      {
        
      return new Promise((resolve, reject) => {
        console.log('getting postings by location.. ' + searchParams.location)

        db.query(
          "SELECT posting_id, title, description, location, shipping_method, price, category, image_link FROM postings WHERE location = $1",
          [searchParams.location],
          function (error, result) {
            if (result.rows[0] == undefined || error != undefined) {
              reject("no such posting");
            } else {
              console.log(result.rows);
              resolve(result.rows);
            }
          }
        );
      });
      }
      else if(!searchParams.location && searchParams.category)
      {
        
      return new Promise((resolve, reject) => {
        console.log('getting postings by category.. ' + searchParams.category)

        db.query(
          "SELECT posting_id, title, description, location, shipping_method, price, category, image_link FROM postings WHERE category = $1",
          [searchParams.category],
          function (error, result) {
            if (result.rows[0] == undefined || error != undefined) {
              reject("no such posting");
            } else {
              console.log(result.rows);
              resolve(result.rows);
            }
          }
        );
      });
      }
      else if(searchParams.location && searchParams.category)
      {
        
      return new Promise((resolve, reject) => {
        console.log('getting postings by category and location .. ');
        console.log(searchParams);

        db.query(
          "SELECT posting_id, title, description, location, shipping_method, price, category, image_link FROM postings WHERE location = $1 AND category = $2",
          [searchParams.location, searchParams.category],
          function (error, result) {
            if (result.rows[0] == undefined || error != undefined) {
              reject("no such posting");
            } else {
              console.log(result.rows);
              resolve(result.rows);
            }
          }
        );
      });
      }
    },

  //delete a posting by its id, current user id required
  deletePostingById: async (posting_id, user_id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await db.query(
          "DELETE FROM postings WHERE user_id = $1 AND posting_id = $2 ",
          [user_id, posting_id]
        );
        console.log('deleting posting..' + posting_id);
        if (result.rowCount > 0) {
          resolve("posting deleted",true);
        } else {
          reject("no such posting");
        }
      } catch {
        reject(error);
      }
    });
  },
  updatePostingById: async (posting_id, updatedPosting) => {
    console.log('editting posting..' + posting_id)
    console.log(updatedPosting);
    return new Promise(async (resolve, reject) => {
      try {
        const result = await db
          .query(
            "UPDATE postings SET title = $1, description = $2, price = $3, location = $4, category = $5 WHERE posting_id = $6 " ,
            [updatedPosting.title, updatedPosting.description, updatedPosting.price, updatedPosting.location, updatedPosting.category, posting_id]
          );
        if (result.rowCount > 0) {
        
          resolve("posting edited", true);
        } else {
          reject("editting posting error");
        }
      } catch (error) {
        console.log(error);
        return reject(error);
      }
    });
  },
};
