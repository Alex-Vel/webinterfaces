const db = require("../db/index");
const { v4: uuidv4 } = require("uuid");

async function getUserById(user_id) {
  return new Promise((resolve, reject) => {
    db.query(
        "SELECT user_id, username, email, location, birth_date FROM users WHERE user_id = $1 ",
        [user_id],
        function (error, result) {
        if (result.rows.length < 1 || error !== undefined) {
          console.log("error happun : " + user_id + error);
          console.log(result.rows + result.rows.length);
          reject("no such user");
        } else {
            console.log(result.rows[0] + result.rows.length);
          resolve(result.rows);
          
        }
      }
    );
  });
}

async function getUserByName(username) {
  console.log("get user by name..");
  return new Promise((resolve, reject) => {
    console.log("username is: " + username);
    db.query(
      "SELECT user_id, username, email, location, birth_date FROM users WHERE username = $1 ",
      [username],
      function (error, result) {
        console.log(result.rows);
        if (result.rows.length < 1 || error != undefined) {
          reject("no such user");
        } else {
          console.log(result.rows);
          resolve(result.rows[0]);
        }
      }
    );
  });
}

module.exports = {
  getAll: async () => {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM users", function (error, rows) {
        error !== null ? reject(error) : null;

        resolve(rows);
      });
    });
  },
  createNew: async (user) => {
    return new Promise((resolve, reject) => {
      console.log("user is" + user.username);
      // Check if user exists
      db.query(
        "SELECT * FROM users WHERE username = $1 ",
        [user.username],
        function (error, result) {
          if (error != null) {
            reject(error);
          } else if (result.rows.length > 0) {
            reject("User exists");
          } else {
            // Create new user if no user exists
            db.query(
              "INSERT INTO users (username, email, password, location, birth_date) VALUES ($1, $2, $3, $4, $5) ",
              [
                user.username,
                user.email,
                user.password,
                user.location,
                user.birth_date,
              ]
            )
              .then(() => {
                return getUserByName(user.username);
              })
              .then((user) => resolve(user))
              .catch((error) => reject(error));
          }
        }
      );
    });
  },
  getUserById: getUserById,
  getUserByName: getUserByName,
  deleteById: async (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await db.query("DELETE FROM users WHERE user_id = $1 ", [
          userId,
        ]);
        console.log(result);
        if (result.rowCount > 0) {
          resolve(true);
        } else {
          reject("no such user");
        }
      } catch {
        reject(error);
      }
    });
  },
  modify: async (user) => {
    return db.query(
      " UPDATE users SET username = $1, email = $2 WHERE user_id = $3 "[
        (user.username, user.email, user.user_id)
      ]
    );
  },
};
