const chai = require('chai');
chai.use(require('chai-json-schema'));
chai.use(require('chai-http'))
const expect = require('chai').expect;
const assert = require('chai').assert;
//const users = require('../services/users');
const api = 'http://localhost:4000';
//const dbService = require("../db/index");
//const createUserSuccessfullySchema = require('../schemas/createUserSuccessfullySchema.json');
//const errorResponseSchema = require('../schemas/errorResponseSchema.json');
const apiServer = require('../server');
const jsonwebtoken = require('jsonwebtoken');
let jwtReturn = null; 

function createTestUser()
{
 return chai.request(api)
 .post('/users')
 .set('Content-Type', 'application/json')
 .send({
  username: "Tester3",
  password: "password123",
  location: "TestTown",
  birth_date: "05-04-1992",
  email:"Test@test.com"
});
}

describe('User HTTP Routes', function() {
  before(async function() {
    apiServer.start('test');
  });

  after(async function() {
    apiServer.close();
  });

  describe('Create new user', function() {
    it('Should create a new user successfully', async function() {
      await createTestUser()
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(201);
         // expect(response.body).to.be.jsonSchema(createUserSuccessfullySchema);
        })
        .catch(error => {
          assert.fail(error);
        });
    });

    it('Should fail if usename exists', async function() {
      await chai.request(api)
        .post('/users')
        .set('Content-Type', 'application/json')
        .send({
          username: "Tester3",
          password: "password123"
        })
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(400);
        //  expect(response.body).to.be.jsonSchema(errorResponseSchema);
        })
        .catch(error => {
          throw error;
        });
    });

    it('Should fail with missing username', async function() {

      await chai.request(api)
        .post('/users')
        .set('Content-Type', 'application/json')
        .send({
          password: "HTTPTesterPassword"
        })
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(400);
       //   expect(response.body).to.be.jsonSchema(errorResponseSchema);
        })
        .catch(error => {
          throw error;
        });
    });

    it('Should fail with missing password', async function() {
      const date = new Date();
      await chai.request(api)
        .post('/users')
        .set('Content-Type', 'application/json')
        .send({
          username: "HTTPTester" + date.getTime()
        })
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(400);
        //  expect(response.body).to.be.jsonSchema(errorResponseSchema);
        })
        .catch(error => {
          throw error;
        });
    });

    it('Should fail with numeric username', async function() {
      await chai.request(api)
        .post('/users')
        .set('Content-Type', 'application/json')
        .send({
          username: 23466567,
          password: "password123"
        })
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(400);
        //  expect(response.body).to.be.jsonSchema(errorResponseSchema);
        })
        .catch(error => {
          throw error;
        });
    });
  });

  describe('Login', function() {
    it('Should login successfully', async function() {
      await chai.request(api)
        .get('/users/login')
        .auth('Tester3', 'password123')
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(200);
          expect(response.body).to.have.property('jwt');
        })
        .catch(error => {
          throw error;
        });
    });

    it('Should not login with incorrect username', async function() {
      await chai.request(api)
        .get('/users/login')
        .auth('usertesternotexisting', 'passwordnotexisting')
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(401);
        })
        .catch(error => {
          throw error;
        });
    });

    it('Should not login with incorrect password', async function() {
      await chai.request(api)
        .get('/users/login')
        .auth('HTTPTester1', 'IncorrectPassword')
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(401);
        })
        .catch(error => {
          throw error;
        });
    });

    it('Should not login with missing username', async function() {
      await chai.request(api)
        .get('/users/login')
        .auth(null, 'IncorrectPassword')
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(401);
        })
        .catch(error => {
          throw error;
        });
    });

    it('Should not login with missing password', async function() {
      await chai.request(api)
        .get('/users/login')
        .auth('HTTPTester1', null)
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(401);
        })
        .catch(error => {
          throw error;
        });
    });

    it('Should not login without auth information', async function() {
      await chai.request(api)
        .get('/users/login')
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(401);
        })
        .catch(error => {
          throw error;
        });
    });
  });

  describe('Modify user', function() {
    let userJwt = null;
    let decodedJwt = null;

    before(async function(){
      await chai.request(api)
        .get('/users/login')
        .auth('Tester3', 'password123')
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(200);
          expect(response.body).to.have.property('jwt');

          userJwt = response.body.jwt;
          decodedJwt = jsonwebtoken.decode(userJwt, { complete: true });
        });
    });

    it('Should modify username successfully', async function() {
      await chai.request(api)
        .put('/users')
        .set('Authorization', 'Bearer ' + userJwt)
        .send({
          username: "Tester3Modified",
          email: "modified@email.com",
        })
        .then(modifyResponse => {
          expect(modifyResponse).to.have.property('status');
          expect(modifyResponse.status).to.equal(200);
          return chai.request(api)
            .get('/users/' + decodedJwt.payload.user.id)
            .set('Authorization', 'Bearer ' + userJwt);
        })
        .then(readResponse => {
          expect(readResponse).to.have.property('status');
          expect(readResponse.status).to.equal(200);
          expect(readResponse.body).to.haveOwnProperty('user_id');
          expect(readResponse.body).to.haveOwnProperty('username');
          expect(readResponse.body).not.haveOwnProperty('password');
          expect(readResponse.body.user_id).to.equal(decodedJwt.payload.user.id);

          expect(readResponse.body.username).to.equal("Tester3Modified");
        })
        .catch(error => {
          throw error;
        });
    });

    it('Should delete a user', async function() {
      await chai.request(api)
        .delete('/users')
        .set('Authorization', 'Bearer ' + userJwt)
        .then(deleteResponse => {
          expect(deleteResponse).to.have.property('status');
          expect(deleteResponse.status).to.equal(200);

          // try to login again with the deleted user
          return chai.request(api)
            .get('/users/login')
            .auth("Tester3Modified", 'password123');
        })
        .then(newLoginResponse => {
          expect(newLoginResponse).to.have.property('status');
          expect(newLoginResponse.status).to.equal(401);


          // Create the test for postings routes
          return createTestUser();
        })
        .then(createUserResponse => {
          expect(createUserResponse).to.have.property('status');
          expect(createUserResponse.status).to.equal(201);
        })
        .catch(error => {
          throw error;
        });
    });
  });
});


describe('Postings HTTP Routes', function() {
  let userJwt = null;
  let decodedJwt = null;

  before(async function() {
    apiServer.start('test');

    await chai.request(api)
      .get('/users/login')
      .auth('Tester3', 'password123')
      .then(response => {
        userJwt = response.body.jwt;
        decodedJwt = jsonwebtoken.decode(userJwt, { complete: true });
      });
  });

  after(async function() {
    apiServer.close();
  });

  describe('Create a new posting', function() {
    it('Should create a new posting for user', async function() {
      await chai.request(api)
        .post('/postings')
        .set('Authorization', 'Bearer ' + userJwt)
        .send({
          "title": "posting Title",
          "description": "posting description",
          "location": "posting location",
          "price": 21.50,
          "shipping_method": "delivery method",
          "posting_config": {},
          "category": "cars"
      })
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(201);
        })
        .catch(error => {
          assert.fail(error);
        });
    });
  });

  let storedPostings= null;

  describe('Get postings', function() {
    it('Should get this user postings', async function() {
      await chai.request(api)
        .get('/postings/user/' + decodedJwt.payload.user.id)
        .set('Authorization', 'Bearer ' + userJwt)
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(200);
          //expect(response.body).to.be.jsonSchema(allTodosSchema);
          expect(response.body.postings).to.have.lengthOf(1);
          expect(response.body.postings[0].title).to.equal("posting Title");
          expect(response.body.postings[0].description).to.equal("posting description");
          storedPostings = response.body.postings;
          console.log(storedPostings[0].posting_id)
        })
        .catch(error => {
          assert.fail(error);
        });
    });
  });

  describe('Get a single posting', function() {
    it('should get a posting with valid id', async function() {
      console.log('getting post with id.. ' + (storedPostings[0].posting_id) )
      await chai.request(api)
        .get('/postings/' + (storedPostings[0].posting_id))
       // .set('Authorization', 'Bearer ' + userJwt)
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(200);
         // expect(response.body).to.be.jsonSchema(singleTodoSchema);
          expect(response.body.posting_id).to.equal(storedPostings[0].posting_id);

        })
        .catch(error => {
          assert.fail(error);
        });
    });

    it('should fail to get a posting with invalid id', async function() {
      await chai.request(api)
        .get('/postings/' + 1234567890)
        .set('Authorization', 'Bearer ' + userJwt)
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(404);

        })
        .catch(error => {
          assert.fail(error);
        });
    });
  });

  describe('Modify posting', function() {
    it('Should modify posting price', async function() {
      await chai.request(api)
        .put('/postings/' + storedPostings[0].posting_id)
        .set('Authorization', 'Bearer ' + userJwt)
        .send({
          "title": "posting Title",
          "description": "posting description",
          "location": "posting location",
          "price": 100,
          "shipping_method": "delivery method",
          "posting_config": {},
          "category": "cars"
      })
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(200);
          return chai.request(api)
            .get('/postings/' + storedPostings[0].posting_id)
            .set('Authorization', 'Bearer ' + userJwt);
        })
        .then(checkResponse => {
          expect(checkResponse.body.price).to.equal(100);
        })
        .catch(error => {
          assert.fail(error);
        });
    });

    it('Should fail to edit with missing fields', async function() {
      await chai.request(api)
        .put('/postings/' + storedPostings[0].posting_id)
        .set('Authorization', 'Bearer ' + userJwt)
        .send({
          "description": "This description should not be saved"
        })
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(400);
          return chai.request(api)
            .get('/postings/' + storedPostings[0].posting_id)
            .set('Authorization', 'Bearer ' + userJwt);
        })
        .then(checkResponse => {
          // Check that description is not changed
          expect(checkResponse.body).to.have.property('description');
          expect(checkResponse.body.description).to.equal(storedPostings[0].description);
        })
        .catch(error => {
          assert.fail(error);
        });
    });

    it('Should fail with non-existing posting id', async function() {
      await chai.request(api)
        .put('/postings/' + 12345678912345)
        .set('Authorization', 'Bearer ' + userJwt)
        .send({
          "title": "posting Title",
          "description": "posting description",
          "location": "posting location",
          "price": 100,
          "shipping_method": "delivery method",
          "posting_config": {},
          "category": "cars"
      })
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(404);
        })
        .catch(error => {
          assert.fail(error);
        });
    });
  });

  describe('Delete a posting', function() {
    it('Should delete a posting', async function() {
      await chai.request(api)
        .delete('/postings/' + storedPostings[0].posting_id)
        .set('Authorization', 'Bearer ' + userJwt)
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(200);
          return chai.request(api)
            .get('/postings/' + storedPostings[0].posting_id)
            .set('Authorization', 'Bearer ' + userJwt);
        })
        .then(checkResponse => {
          expect(checkResponse).to.have.property('status');
          expect(checkResponse.status).to.equal(404);
        })
        .catch(error => {
          assert.fail(error);
        });
    });

    it('Should fail to delete a non existing posting', async function() {
      await chai.request(api)
        .delete('/postings/' + 1234567891)
        .set('Authorization', 'Bearer ' + userJwt)
        .then(response => {
          expect(response).to.have.property('status');
          expect(response.status).to.equal(404);
        })
        .catch(error => {
          assert.fail(error);
        });
    });

    it('Should delete the last user', async function() {
      await chai.request(api)
        .delete('/users')
        .set('Authorization', 'Bearer ' + userJwt)
        .then(deleteResponse => {
          expect(deleteResponse).to.have.property('status');
          expect(deleteResponse.status).to.equal(200);

          // try to login again with the deleted user
          return chai.request(api)
            .get('/users/login')
            .auth('Tester3', 'password123')
        })
        .then(newLoginResponse => {
          expect(newLoginResponse).to.have.property('status');
          expect(newLoginResponse.status).to.equal(401);
        })
        .catch(error => {
          throw error;
        });
    });
  })

  //clean database



});