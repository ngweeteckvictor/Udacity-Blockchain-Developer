import "babel-polyfill";
import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';
var BigNumber = require('bignumber.js');

const config = Config['localhost'];
const web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
const flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

// Flight status codees
const STATUS_CODE_UNKNOWN = 0;
const STATUS_CODE_ON_TIME = 10;
const STATUS_CODE_LATE_AIRLINE = 20;
const STATUS_CODE_LATE_WEATHER = 30;
const STATUS_CODE_LATE_TECHNICAL = 40;
const STATUS_CODE_LATE_OTHER = 50;

const STATUS_CODE = [STATUS_CODE_UNKNOWN, STATUS_CODE_ON_TIME,
  STATUS_CODE_LATE_AIRLINE, STATUS_CODE_LATE_WEATHER,
  STATUS_CODE_LATE_TECHNICAL, STATUS_CODE_LATE_OTHER];

const airlineName = [
  "Singapore Airlines",
  "Scoot",
  "Udacity Airlines",
  "Air Singapore"
];

var accounts;

const ORACLES_COUNT = 20;

init();

async function init() {
  accounts = await web3.eth.getAccounts();
  await registerAirlines();
  await registerFlights();
  await registerOracles();

}

async function registerAirlines() {
  for (let idx = 1; idx <= airlineName.length; idx++) {
    try {
      await flightSuretyApp.methods.registerAirline(airlineName[idx], accounts[idx + 1]).send({
        from: accounts[idx],
        gas: 500000
      });

      await flightSuretyApp.methods.fund(accounts[idx + 1]).send({
        from: accounts[idx + 1],
        value: 10 * (new BigNumber(10)).pow(18),
        gas: 500000
      });

      await console.log('Airline: ' + airlineName[idx] + ' registered successfully');
    }
    catch (error) { }
  }
}

async function registerFlights() {

  let timestamp = Math.floor(Date.now() / 10000000);
  try {
    await flightSuretyApp.methods.registerFlight(accounts[1], "SQ123", timestamp).send({
      from: accounts[1],
      gas: 500000
    });

    await console.log('Flight: SQ123 registered successfully');

    await flightSuretyApp.methods.registerFlight(accounts[2], "TR456", timestamp).send({
      from: accounts[2],
      gas: 500000
    });

    await console.log('Flight: TR456 registered successfully');

    await flightSuretyApp.methods.registerFlight(accounts[3], "UN789", timestamp).send({
      from: accounts[3],
      gas: 500000
    });

    await console.log('Flight: UN789 registered successfully');

    await flightSuretyApp.methods.registerFlight(accounts[4], "AS1357", timestamp).send({
      from: accounts[4],
      gas: 500000
    });

    await console.log('Flight: AS1357 registered successfully');
  }
  catch (error) { }
}

// register Oracles
async function registerOracles() {
  const fee = await flightSuretyApp.methods.REGISTRATION_FEE().call();

  for (let a = 1; a < ORACLES_COUNT; a++) {
    try {
      await flightSuretyApp.methods.registerOracle().send({
        from: accounts[a],
        value: fee,
        gas: 500000
      });
      let indexes = await flightSuretyApp.methods.getMyIndexes().call({ from: accounts[a] });
      await console.log('Oracle Registration: ' + indexes[0] + ',' + indexes[1] + ',' + indexes[2]);
    }
    catch (error) { }
  }
  await console.log('Oracles registration completed');
}

// OracleRequest event
flightSuretyApp.events.OracleRequest({ fromBlock: 'latest' }, async function (error, event) {
  if (error) {
    console.log(error);
  }
  else {
    const index = event.returnValues.index;
    const airline = event.returnValues.airline;
    const flight = event.returnValues.flight;
    const timestamp = event.returnValues.timestamp;
    console.log("index: " + index);
    console.log("airline: " + airline);
    console.log("flight: " + flight);
    console.log("timestamp: " + timestamp);

    const statusCode = STATUS_CODE[Math.floor(Math.random() * STATUS_CODE.length)];
    console.log("status: " + statusCode);

    for (let a = 1; a < ORACLES_COUNT; a++) {
      try {
        await flightSuretyApp.methods.submitOracleResponse(index, airline, flight, timestamp, statusCode).send({
          from: accounts[a],
          gas: 500000
        });
      }
      catch (error) { }
    }
  }
});

// OracleReport event
flightSuretyApp.events.OracleReport({ fromBlock: 'latest' }, function (error, event) {
  if (error) {
    console.log(error);
  }
  else {
    console.log('OracleReport Event');
  }
});

// FlightStatusInfo event
flightSuretyApp.events.FlightStatusInfo({ fromBlock: 'latest' }, async function (error, event) {
  if (error) {
    console.log(error);
  }
  else {
    console.log('FlightStatusInfo event');

    const airline = event.returnValues.airline;
    const flight = event.returnValues.flight;
    const timestamp = event.returnValues.timestamp;
    const statusCode = event.returnValues.status;

    console.log("airline: " + airline);
    console.log("flight: " + flight);
    console.log("timestamp: " + timestamp);
    console.log("statuCode: " + statusCode);

    if (statusCode == STATUS_CODE_LATE_AIRLINE) {
      console.log('Flight is delayed due to airline, credit insurees');
    }
  }
});

const app = express();
app.get('/api', (req, res) => {
  res.send({
    message: 'An API for use with your Dapp!'
  })
})

export default app;
