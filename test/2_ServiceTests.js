const chai = require("chai");
chai.use(require("chai-json-schema"));
const expect = require("chai").expect;
const assert = require("chai").assert;
const users = require("../services/users");
const dbService = require("../db/index");
const userSchema = require("../schemas/userCreateResponseSchema.json");
const apiServer = require("../server");
let userId = null;
let secondUserId = null;

describe("User Service", function () {
  // before(async function() {
  //   await dbService.init('db.test.sqlite');
  // });

  // after(async function() {
  //   await dbService.close();
  // });
  before(async function () {
    apiServer.start("test");
  });

  after(async function () {
    apiServer.close();
  });

  describe("Get all users", function () {
    it("Should get an empty array", async function () {
      await users.getAll().then((result) => {
        expect(result).to.be.an("array").and.to.have.lengthOf(0);
      });
    });
  });

  describe("Create new user", function () {
    it("Should create a new user", async function () {
      await users.createNew({
          username: "Tester1",
          password: "password123",
          location: "TestTown",
          birth_date: "05-04-1992",
          email: "test1@test.com",
        })
        .then((user) => {
          userId = user.user_id;
          expect(user).to.be.jsonSchema(userSchema);
        })
        .catch((error) => {
          assert.fail();
        });
    });

    it("Should not create a new user, because username exists", async function () {
      await users
        .createNew({
          username: "Tester1",
          password: "password123",
          location: "TestTown",
          birth_date: "05-04-1992",
          email: "test1@test.com",
        })
        .then((user) => {
          assert.fail(
            "User succesfully created with username already existing"
          );
        })
        .catch((error) => {
          expect(error).to.equal("User exists");
        });
    });

    it("Should try to create a new user with missing parameters and survive", async function () {
      await users
        .createNew({
          username: "Tester2",
          location: "TestTown",
          birth_date: "05-04-1992",
          email: "test2@test.com",
        })
        .then((user) => {
          assert.fail("User succesfully created with missing password field");
        })
        .catch((error) => {
          expect(error).to.have.property("code",'23502');
        });
    });

    it("Should create a second user and verifiy getting all", async function () {
      const date = new Date();
      await users
        .createNew({
          username: "Tester2",
          password: "password123",
          location: "TestTown",
          birth_date: "05-04-1992",
          email: "Test2@Test.com",
        })
        .then((user) => {
          secondUserId = user.user_id;
          return users.getAll();
        })
        .then((result) => {
          expect(result).to.be.an("array").and.to.have.lengthOf(2);
        })
        .catch((error) => {
          assert.fail("User create or getAll failed");
        });
    });
  });

  describe("Delete a user", function () {
    it("Should delete a user successfully", async function () {
      let startingUserCount = null;
      let deletedUserId = userId;
      await users
        .getAll()
        .then((result) => {
          // Save current user count
          startingUserCount = result.length;
          expect(result).to.be.an("array");
          // Delete a user
          return users.deleteById(deletedUserId);
        })
        .then((deleteRespose) => {
          expect(deleteRespose).to.be.true;
          return users.getAll();
        })
        .then((result) => {
          // Verify that user count has reduced by one
          expect(result).to.be.an("array").and.to.have.lengthOf(startingUserCount - 1);
        })
        .catch((error) => {
          assert.fail(error);
        });
    });
    it("Should not delete user with non-existing ID", async function () {
      let startingUserCount = null;
      await users
        .getAll()
        .then(async (results) => {
          // Save current user count
          expect(result).to.be.an("array");
          startingUserCount = results.length;

          const date = new Date();
          const deletedUserId = date.getTime(); // time in milliseconds for a 'random' int value
          // Try to delete a user
          const deleteResult = await users.deleteById(deletedUserId);
          assert.fail("User delete promise should not resolve");
        })
        .catch((error) => {
          expect(error).to.be.instanceOf(Object);
        });
    });
  });

  describe("Modify a user", function () {
    it("Should modify username successfully", async function () {
      await users
          .modify({
            id: secondUserId,
            username: "modifiedUsername",
            email: "modifiedemail@email.com"
          })
        .then((modifyResponse) => {
          expect(modifyResponse).to.be.true;
          return users.getUserById(secondUserId);
        })
        .then((user) => {
          console.log(secondUserId);
          // Verify that username has been modified
          expect(user).to.have.property("username", "modifiedUsername");
        })
        .catch((error) => {
          assert.fail(error);
        });
    });

    
  it("Should delete the last user successfully", async function () {
    let startingUserCount = null;
    await users
      .getAll()
      .then((result) => {
        // Save current user count
        startingUserCount = result.length;
        expect(result).to.be.an("array");
        // Delete a user
        console.log('deleting last user..' + secondUserId);
        return users.deleteById(secondUserId);
      })
      .then((deleteRespose) => {
        expect(deleteRespose).to.be.true;
        return users.getAll();
      })
      .then((result) => {
        // Verify that user count has reduced by one
        expect(result).to.be.an("array").and.to.have.lengthOf(startingUserCount - 1);
      })
      .catch((error) => {
        assert.fail(error);
      });
  });

  });


});
