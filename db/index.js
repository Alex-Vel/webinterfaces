
const config = require('config');
let postgres = require('pg');
const { post } = require('../routes/users');
let pool = null;


try {
  pool = new postgres.Pool({
    connectionLimit: 10,
    host: config.get('database.host'),
    port: config.get('database.port'),
    user: config.get('database.user'),
    password: config.get('database.password'),
    database: config.get('database.name'),
    multipleStatements: true
  });
console.log("db opened up! " + pool.options.database);


} catch (error) {
  console.error('postgres pool create failed');
  console.log("db error! " + pool.options.database);
  console.error(error);
}



const api = {
  query: (query, ...parameters) => {
    let promise = new Promise(function (resolve, reject) {
      pool.query(query, ...parameters, (error, results, fields) => {
        if (error) {
          reject(error)
        };

        resolve(results);
      })
    });

    return promise;
  },
  closeAll: () => {
    pool.end();
  },
  getDb: () =>{
    return(pool.options.database);
  }
};

module.exports = api;