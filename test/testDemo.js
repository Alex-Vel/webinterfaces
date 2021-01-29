const chai = require('chai');
const expect = require('chai').expect;
chai.use(require('chai-http'));
const server = require('../server');


describe('Demonstration of tests', function() {

    //start the server

    before(function () { 
        server.start();
        })
        
    after(function() {
        server.close();
    })

  describe('Testing route GET /', function() {

    it('should return succesfull response', async function() {
    // expect(false).to.be.true;
    // prepare http request
    // send request
    // check response
       await chai.request('http://localhost:4000').get('/')
        .then(response => {
        //check response
        console.log("response:")
        console.log(response.status + response.body);
        expect(response.status).to.equal(200);
        })
        .catch(error =>{
        //check error
        console.log("error:" + error)
        throw error;
        })

    });
    
    it('another test', function(){

    })
  })
  
  describe('testingh route /test', function(){ 

    it("should return status 200 with correct request", async function() {

    await chai.request('http://localhost:4000')
    .post('/test')
    .send({
        
            stationId: 1234,
            measurementData:{
                temp: 15,
                humidity: 50,
                windSpeed: 0.5

            },
            time: "2020-01-25T00:00:00"
            
            
    })

    .then(response => {
    expect(response.status).to.equal(200);
    console.log(response.body);
    })
    .catch(error =>{
        throw error;
    });
    })
    // it("should return status 200 with correct request", function() {})
    // it("should return status 200 with correct request", function() {})
    // it("should return status 200 with correct request", function() {})

  })
});