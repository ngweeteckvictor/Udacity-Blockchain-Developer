const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const fs = require('fs');
var BigNumber = require('bignumber.js');

module.exports = async (deployer, network, accounts) => {

    let contractOwner = accounts[0];
    let firstAirline = accounts[1];
    let firstAirlineName = "Singapore Airlines";

    await deployer.deploy(FlightSuretyData, { from: contractOwner });
    await deployer.deploy(FlightSuretyApp, FlightSuretyData.address, { from: contractOwner });

    let dataContract = await FlightSuretyData.deployed();
    await dataContract.authorizeCaller(FlightSuretyApp.address, { from: contractOwner });
    
    //register the first airline and fund the flight surety
    await dataContract.registerAirline(firstAirlineName, firstAirline, { from: contractOwner });
    
    let appContract = await FlightSuretyApp.deployed();
    await appContract.fund(firstAirline, { from: firstAirline,  value: 10 * (new BigNumber(10)).pow(18)});

    let config = {
        localhost: {
            url: 'http://localhost:8545',
            dataAddress: FlightSuretyData.address,
            appAddress: FlightSuretyApp.address
        }
    }
    fs.writeFileSync(__dirname + '/../src/dapp/config.json', JSON.stringify(config, null, '\t'), 'utf-8');
    fs.writeFileSync(__dirname + '/../src/server/config.json', JSON.stringify(config, null, '\t'), 'utf-8');
}