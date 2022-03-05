var Test = require('../config/testConfig.js');
const truffleAssert = require('truffle-assertions');

contract('Flight Surety Tests', async (accounts) => {

    var config;
    before('setup contract', async () => {
        config = await Test.Config(accounts);
    });

    const airlineName = [
        null,
        "Singapore Airlines",
        "Scoot",
        "Udacity Airlines",
        "Blockchain Airlines",
        "Air Singapore",
        "All Singapore Airlines"
    ];

    /****************************************************************************************/
    /* Operations and Settings                                                              */
    /****************************************************************************************/

    it('(multiparty) has correct initial isOperational() value', async function () {
        
        // Get operating status
        let status = await config.flightSuretyData.isOperational.call();
        assert.equal(status, true, "Incorrect initial operating status value");

    });

    it('(multiparty) can block access to setOperatingStatus() for non-Contract Owner account', async function () {
        
        // Ensure that access is denied for non-Contract Owner account
        let accessDenied = false;
        try {
            await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
        }
        catch (e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, true, "Access not restricted to Contract Owner");

    });

    it('(multiparty) can allow access to setOperatingStatus() for Contract Owner account', async function () {
        
        // Ensure that access is allowed for Contract Owner account
        let accessDenied = false;
        try {
            await config.flightSuretyData.setOperatingStatus(false);
        }
        catch (e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, false, "Access not restricted to Contract Owner");

    });

    it('(multiparty) can block access to functions using requireIsOperational when operating status is false', async function () {

        await config.flightSuretyData.setOperatingStatus(false);

        let reverted = false;
        try {
            await config.flightSurety.setTestingMode(true);
        }
        catch (e) {
            reverted = true;
        }
        assert.equal(reverted, true, "Access not blocked for requireIsOperational");

        // Set it back for other tests to work
        await config.flightSuretyData.setOperatingStatus(true);

    });

    it('(airline) cannot register Airline_2 using registerAirline() if Airline_1 is not funded', async function () {

        // ARRANGE
        let callerAirline = config.firstAirline;
        let newAirline = accounts[2];
        let newAirlineName = airlineName[2];

        // ACT
        await truffleAssert.reverts(
            config.flightSuretyApp.registerAirline(newAirlineName, newAirline, { from: callerAirline }),
            "Caller airline has not participated");

    });

    it('(airline) cannot fund Airline_2 using fund() if Airline_2 not registered', async function () {

        // ARRANGE
        let callerAirline = accounts[2];

        // ACT
        await truffleAssert.reverts(
            config.flightSuretyApp.fund(callerAirline, { from: callerAirline, value: 10 * config.weiMultiple }),
            "Airline is not registered");

    });

    it('(airline) fund Airline_1 using fund() with insufficient fund', async function () {

        // ARRANGE
        let callerAirline = config.firstAirline;

        // ACT
        await truffleAssert.reverts(
            config.flightSuretyApp.fund(callerAirline, { from: callerAirline, value: 1 * config.weiMultiple }),
            "Insufficient fund");

    });

    it('(airline) fund Airline_1 using fund() with 10 Ether', async function () {

        // ARRANGE
        let callerAirline = config.firstAirline;

        // ACT
        let airlineStatusEvent = await config.flightSuretyApp.fund(callerAirline, { from: callerAirline,  value: 10 * config.weiMultiple });

        await truffleAssert.eventEmitted(airlineStatusEvent, "AirlineStatusEvent", (ev) => {
            return ev._status == 2;
        }, "AirlineStatusEvent should be emitted PARTICIPATED");
    
    });

    it('(airline) able to register Airline_2 using registerAirline() after Airline_1 is funded', async function () {

        // ARRANGE
        let callerAirline = config.firstAirline;
        let newAirline = accounts[2];
        let newAirlineName = airlineName[2];

        // ACT
        let airlineStatusEvent = await config.flightSuretyApp.registerAirline(newAirlineName, newAirline, { from: callerAirline });
        await truffleAssert.eventEmitted(airlineStatusEvent, "AirlineStatusEvent", (ev) => {
            return ev._status == 1;
        }, "AirlineStatusEvent should be emitted REGISTERED");

    });

    it('(airline) fund Airline_2 using fund() with 10 Ether', async function () {

        // ARRANGE
        let callerAirline = accounts[2];

        // ACT
        let airlineStatusEvent = await config.flightSuretyApp.fund(callerAirline, { from: callerAirline, value: 10 * config.weiMultiple });

        await truffleAssert.eventEmitted(airlineStatusEvent, "AirlineStatusEvent", (ev) => {
            return ev._status == 2;
        }, "AirlineStatusEvent should be emitted PARTICIPATED");

    });

    it('(airline) able to register Airline_3 using registerAirline() after Airline_2 is funded', async function () {

        // ARRANGE
        let callerAirline = accounts[2];
        let newAirline = accounts[3];
        let newAirlineName = airlineName[3];

        // ACT
        let airlineStatusEvent = await config.flightSuretyApp.registerAirline(newAirlineName, newAirline, { from: callerAirline });
        await truffleAssert.eventEmitted(airlineStatusEvent, "AirlineStatusEvent", (ev) => {
            return ev._status == 1;
        }, "AirlineStatusEvent should be emitted REGISTERED");

    });

    it('(airline) fund Airline_3 using fund() with 10 Ether', async function () {

        // ARRANGE
        let callerAirline = accounts[3];

        // ACT
        let airlineStatusEvent = await config.flightSuretyApp.fund(callerAirline, { from: callerAirline, value: 10 * config.weiMultiple });

        await truffleAssert.eventEmitted(airlineStatusEvent, "AirlineStatusEvent", (ev) => {
            return ev._status == 2;
        }, "AirlineStatusEvent should be emitted PARTICIPATED");
        
    });

    it('(airline) able to register Airline_4 using registerAirline() after Airline_3 is funded', async function () {

        // ARRANGE
        let callerAirline = accounts[3];
        let newAirline = accounts[4];
        let newAirlineName = airlineName[4];

        // ACT
        let airlineStatusEvent = await config.flightSuretyApp.registerAirline(newAirlineName, newAirline, { from: callerAirline });
        await truffleAssert.eventEmitted(airlineStatusEvent, "AirlineStatusEvent", (ev) => {
            return ev._status == 1;
        }, "AirlineStatusEvent should be emitted REGISTERED");

    });

    it('(airline) fund Airline_4 using fund() with 10 Ether', async function () {

        // ARRANGE
        let callerAirline = accounts[4];

        // ACT
        let airlineStatusEvent = await config.flightSuretyApp.fund(callerAirline, { from: callerAirline, value: 10 * config.weiMultiple });

        await truffleAssert.eventEmitted(airlineStatusEvent, "AirlineStatusEvent", (ev) => {
            return ev._status == 2;
        }, "AirlineStatusEvent should be emitted PARTICIPATED");
       
    });

    it('(airline) unable to register Airline_5 using registerAirline(), multi-party consensus required', async function () {

        // ARRANGE
        let callerAirline = accounts[4];
        let newAirline = accounts[5];
        let newAirlineName = airlineName[5];

        // ACT
        await truffleAssert.reverts(
            config.flightSuretyApp.registerAirline(newAirlineName, newAirline, { from: callerAirline }),
            "Not enough consensus to register airline");

    });

    it('(airline) Airline_1 vote for Airline_5 using vote()', async function () {

        // ARRANGE
        let votingAirline = config.firstAirline;
        let voteAirline = accounts[5];

        // ACT
        let airlineVotedEvent = await config.flightSuretyApp.vote(voteAirline, { from: votingAirline });

        await truffleAssert.eventEmitted(airlineVotedEvent, "AirlineVotedEvent", (ev) => {
            return ev._success == true;
        }, "AirlineVotedEvent should be emitted successfully");

    });

    it('(airline) unable to register Airline_5 using registerAirline(), insufficient multi-party consensus required', async function () {

        // ARRANGE
        let callerAirline = accounts[4];
        let newAirline = accounts[5];
        let newAirlineName = airlineName[5];

        // ACT
        await truffleAssert.reverts(
            config.flightSuretyApp.registerAirline(newAirlineName, newAirline, { from: callerAirline }),
            "Not enough consensus to register airline");

    });

    it('(airline) Airline_1 unable to vote for Airline_5 using vote() again', async function () {

        // ARRANGE
        let votingAirline = config.firstAirline;
        let voteAirline = accounts[5];

        // ACT
        await truffleAssert.reverts(
            config.flightSuretyApp.vote(voteAirline, { from: votingAirline }),
            "Duplicate vote");

    });

    it('(airline) Airline_2 vote for Airline_5 using vote()', async function () {

        // ARRANGE
        let votingAirline = accounts[2];
        let voteAirline = accounts[5];

        // ACT
        let airlineVotedEvent = await config.flightSuretyApp.vote(voteAirline, { from: votingAirline });

        await truffleAssert.eventEmitted(airlineVotedEvent, "AirlineVotedEvent", (ev) => {
            return ev._success == true;
        }, "AirlineVotedEvent should be emitted successfully");

    });

    it('(airline) able to register Airline_5 using registerAirline(), sufficient multi-party consensus', async function () {

        // ARRANGE
        let callerAirline = accounts[4];
        let newAirline = accounts[5];
        let newAirlineName = airlineName[5];

        // ACT
        let airlineStatusEvent = await config.flightSuretyApp.registerAirline(newAirlineName, newAirline, { from: callerAirline });
        await truffleAssert.eventEmitted(airlineStatusEvent, "AirlineStatusEvent", (ev) => {
            return ev._status == 1;
        }, "AirlineStatusEvent should be emitted REGISTERED");

    });

    it('(airline) fund Airline_5 using fund() with 10 Ether', async function () {

        // ARRANGE
        let callerAirline = accounts[5];

        // ACT
        let airlineStatusEvent = await config.flightSuretyApp.fund(callerAirline, { from: callerAirline, value: 10 * config.weiMultiple });

        await truffleAssert.eventEmitted(airlineStatusEvent, "AirlineStatusEvent", (ev) => {
            return ev._status == 2;
        }, "AirlineStatusEvent should be emitted PARTICIPATED");

    });

    it('(airline) unable to register Airline_6 using registerAirline(), multi-party consensus required', async function () {

        // ARRANGE
        let callerAirline = accounts[5];
        let newAirline = accounts[6];
        let newAirlineName = airlineName[6];

        // ACT
        await truffleAssert.reverts(
            config.flightSuretyApp.registerAirline(newAirlineName, newAirline, { from: callerAirline }),
            "Not enough consensus to register airline");

    });

    it('(airline) Airline_1 and Airline_2 vote for Airline_6 using vote()', async function () {

        // ARRANGE
        let votingAirline1 = accounts[1];
        let votingAirline2 = accounts[2];
        let voteAirline = accounts[6];

        // ACT
        let airline1VotedEvent = await config.flightSuretyApp.vote(voteAirline, { from: votingAirline1 });

        await truffleAssert.eventEmitted(airline1VotedEvent, "AirlineVotedEvent", (ev) => {
            return ev._success == true;
        }, "AirlineVotedEvent should be emitted successfully");

        let airline2VotedEvent = await config.flightSuretyApp.vote(voteAirline, { from: votingAirline2 });

        await truffleAssert.eventEmitted(airline2VotedEvent, "AirlineVotedEvent", (ev) => {
            return ev._success == true;
        }, "AirlineVotedEvent should be emitted successfully");

    });

    it('(airline) unable to register Airline_6 using registerAirline(), insufficient multi-party consensus required', async function () {

        /// ARRANGE
        let callerAirline = accounts[5];
        let newAirline = accounts[6];
        let newAirlineName = airlineName[6];

        // ACT
        await truffleAssert.reverts(
            config.flightSuretyApp.registerAirline(newAirlineName, newAirline, { from: callerAirline }),
            "Not enough consensus to register airline");

    });

    it('(airline) Airline_3 vote for Airline_6 using vote()', async function () {

        // ARRANGE
        let votingAirline = accounts[3];
        let voteAirline = accounts[6];

        // ACT
        let airlineVotedEvent = await config.flightSuretyApp.vote(voteAirline, { from: votingAirline });

        await truffleAssert.eventEmitted(airlineVotedEvent, "AirlineVotedEvent", (ev) => {
            return ev._success == true;
        }, "AirlineVotedEvent should be emitted successfully");

    });

    it('(airline) able to register Airline_6 using registerAirline(), sufficient multi-party consensus', async function () {

        // ARRANGE
        let callerAirline = accounts[5];
        let newAirline = accounts[6];
        let newAirlineName = airlineName[6];

        // ACT
        let airlineStatusEvent = await config.flightSuretyApp.registerAirline(newAirlineName, newAirline, { from: callerAirline });
        await truffleAssert.eventEmitted(airlineStatusEvent, "AirlineStatusEvent", (ev) => {
            return ev._status == 1;
        }, "AirlineStatusEvent should be emitted REGISTERED");

    });

    it('(airline) fund Airline_6 using fund() with 10 Ether', async function () {

        // ARRANGE
        let callerAirline = accounts[6];

        // ACT
        let airlineStatusEvent = await config.flightSuretyApp.fund(callerAirline, { from: callerAirline, value: 10 * config.weiMultiple });

        await truffleAssert.eventEmitted(airlineStatusEvent, "AirlineStatusEvent", (ev) => {
            return ev._status == 2;
        }, "AirlineStatusEvent should be emitted PARTICIPATED");
     
    });

    it('(Passenger) passenger_1 buy flight insurance with 1 Ether ', async function () {

        // ARRANGE
        let airline = accounts[1];
        let flight = "SQ123";
        let timestamp = Math.floor(Date.now() / 10000000);
        let callerPassenger = accounts[7];

        // ACT
        let BuyFlightInsurance = await config.flightSuretyApp.buyFlightInsurance(
            airline,
            flight, 
            timestamp,
            callerPassenger, { from: callerPassenger, value: 1 * config.weiMultiple });
        await truffleAssert.eventEmitted(BuyFlightInsurance, "BuyFlightInsurance");
     
    });    
    
    it('(Passenger) Passenger_2 buy flight insurance with 1 Ether ', async function () {

        // ARRANGE
        let airline = accounts[1];
        let flight = "SQ123";
        let timestamp = Math.floor(Date.now() / 10000000);
        let callerPassenger = accounts[8];

        // ACT
        let BuyFlightInsurance = await config.flightSuretyApp.buyFlightInsurance(
            airline,
            flight, 
            timestamp,
            callerPassenger, { from: callerPassenger, value: 1 * config.weiMultiple });
        await truffleAssert.eventEmitted(BuyFlightInsurance, "BuyFlightInsurance");
     
    });
});
