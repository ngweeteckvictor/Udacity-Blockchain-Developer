import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {

            this.owner = accts[0];

            let counter = 1;

            while (this.airlines.length < 4) {
                this.airlines.push(accts[counter++]);
            }

            while (this.passengers.length < 2) {
                this.passengers.push(accts[counter++]);
            }

            callback();
        });
    }

    isOperational(callback) {
        let self = this;
        self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner }, callback);
    }

    getAirline(callback) {
        let self = this;
        self.flightSuretyData.methods
            .getAirlineName(self.airlines[0])
            .call({ from: self.owner }, (error, result) => {
                let payload = {
                    airlineName: result,
                    airlineAddress: self.airlines[0]
                }
                callback(payload);
            });
    }

    getAirlineAddress(callback) {
        let self = this;
        self.flightSuretyData.methods
            .getRegisteredAirlinesAddress()
            .call({ from: self.owner }, (error, result) => {
                callback(result);
            });
    }

    getAirlineName(airline, callback) {
        let self = this;
        self.flightSuretyData.methods
            .getAirlineName(airline)
            .call({ from: self.owner }, (error, result) => {
                callback(result);
            });
    }

    getFlightInfo(airline, callback) {
        let self = this;
        self.flightSuretyData.methods
            .getFlight(airline)
            .call({ from: self.owner }, (error, result) => {
                callback(error, result);
            });
    }

    getFlightNumber(flightKey, callback) {
        let self = this;
        self.flightSuretyData.methods.getFlightNumber(flightKey).call({ from: self.owner }, (error, result) => {
            callback(error, result);
        });
    }

    buyFlightInsurance(airline, flight, amount, callback) {
        let self = this;
        let timestamp = Math.floor(Date.now() / 10000000);

        self.flightSuretyApp.methods
            .buyFlightInsurance(airline, flight, timestamp, self.passengers[0])
            .send({ from: self.passengers[0], value: self.web3.utils.toWei(amount, 'ether'), gas: 500000 }, (error, result) => {
                callback(error, result);
            });

    }

    getCreditsAmount(callback) {
        let self = this;
        self.flightSuretyApp.methods
            .getCreditsAmount(self.passengers[0])
            .call({ from: self.passengers[0] }, callback);

    }

    withdrawCredits(callback) {
        let self = this;
        self.flightSuretyApp.methods
            .withdrawCredits()
            .send({ from: self.passengers[0] }, (error, result) => {
                callback(error, result);
            });
    }

    fetchFlightStatus(airline, flight, callback) {
        let self = this;
        let timestamp = Math.floor(Date.now() / 10000000);
        let payload = {
            flight: flight,
            timestamp: timestamp
        };
        self.flightSuretyApp.methods
            .fetchFlightStatus(airline, flight, timestamp)
            .send({ from: self.owner }, (error, result) => {
                callback(error, payload);
            });

    }
}