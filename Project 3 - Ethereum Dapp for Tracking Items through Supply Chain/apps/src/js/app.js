import Web3 from "web3";
import SupplyChainArtifact from "../../../build/contracts/SupplyChain.json";

const App = {
    web3: null,
    meta: null,

    emptyAddress: "0x0000000000000000000000000000000000000000",
    upc: 0,
    metamaskAccountID: "0x0000000000000000000000000000000000000000",
    ownerID: "0x0000000000000000000000000000000000000000",
    originFarmerID: "0x0000000000000000000000000000000000000000",
    originFarmName: null,
    originFarmInformation: null,
    originFarmLatitude: null,
    originFarmLongitude: null,
    distributorID: "0x0000000000000000000000000000000000000000",
    retailerID: "0x0000000000000000000000000000000000000000",
    consumerID: "0x0000000000000000000000000000000000000000",

    start: async function () {
        App.readForm();
        /// Setup access to supplyChain contract
        return await App.initSupplyChain();
    },

    readForm: function () {
        App.upc = $("#upc").val();
        App.ownerID = $("#ownerID").val();
        App.originFarmerID = $("#originFarmerID").val();
        App.originFarmName = $("#originFarmName").val();
        App.originFarmInformation = $("#originFarmInformation").val();
        App.originFarmLatitude = $("#originFarmLatitude").val();
        App.originFarmLongitude = $("#originFarmLongitude").val();
        App.distributorID = $("#distributorID").val();
        App.retailerID = $("#retailerID").val();
        App.consumerID = $("#consumerID").val();

        console.log(
            App.ownerID, 
            App.originFarmerID, 
            App.originFarmName, 
            App.originFarmInformation, 
            App.originFarmLatitude, 
            App.originFarmLongitude, 
            App.distributorID, 
            App.retailerID, 
            App.consumerID
        );
    },
    
    initSupplyChain: async function () {
        const { web3 } = this;

        try {
            // get contract instance
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = SupplyChainArtifact.networks[networkId];
            this.meta = new web3.eth.Contract(
                SupplyChainArtifact.abi,
                deployedNetwork.address,
            );

            // get accounts
            const accounts = await web3.eth.getAccounts();
            this.metamaskAccountID = accounts[0];
        } catch (error) {
            console.error("Could not connect to contract or chain.");
        }
    },

    harvestApples: async function() {
        const upc = document.getElementById("upc").value;
        const originFarmerID = document.getElementById("originFarmerID").value;
        const originFarmName = document.getElementById("originFarmName").value;
        const originFarmInformation = document.getElementById("originFarmInformation").value;
        const originFarmLatitude = document.getElementById("originFarmLatitude").value;
        const originFarmLongitude = document.getElementById("originFarmLongitude").value;

        try {
            const { harvestApples } = this.meta.methods;
            const event = await harvestApples(
                upc,
                originFarmerID,
                originFarmName,
                originFarmInformation,
                originFarmLatitude,
                originFarmLongitude).send({from: this.metamaskAccountID});
            $("#ftc-item").append("<br>" + "harvestApples: UPC " + event.events.Harvested.returnValues.upc + "<br>");
        }
        catch(err) {
            $("#ftc-item").append("<br>" + "harvestApples: error" + "<br>");
            console.log(err.message);
        }
    },

    packApples: async function () {
        const upc = document.getElementById("upc").value;
        
        try {
            const { packApples } = this.meta.methods;
            const event = await packApples(upc).send({from: this.metamaskAccountID});
            $("#ftc-item").append("<br>" + "packApples: UPC " + event.events.Packed.returnValues.upc + "<br>");
            console.log(event.events.Packed.returnValues);
        }
        catch(err) {
            $("#ftc-item").append("<br>" + "packApples: error" + "<br>");
            console.log(err.message);
        }
    },
    
    shipApplesToDistributor: async function () {
        const upc = document.getElementById("upc").value;
        
        try {
            const { shipApplesToDistributor } = this.meta.methods;
            const event = await shipApplesToDistributor(upc).send({from: this.metamaskAccountID});
            $("#ftc-item").append("<br>" + "shipApplesToDistributor: UPC " + event.events.ShippedToDistributor.returnValues.upc + "<br>");
        }
        catch(err) {
            $("#ftc-item").append("<br>" + "shipApplesToDistributor: error" + "<br>");
            console.log(err.message);
        }
    },

    receiveApplesByDistributor: async function () {
        const upc = document.getElementById("upc").value;
        
        try {
            const { receiveApplesByDistributor } = this.meta.methods;
            const event = await receiveApplesByDistributor(upc).send({from: this.metamaskAccountID});
            $("#ftc-item").append("<br>" + "receiveApplesByDistributor: UPC " + event.events.ReceivedByDistributor.returnValues.upc + "<br>");
        }
        catch(err) {
            $("#ftc-item").append("<br>" + "receiveApplesByDistributor: error" + "<br>");
            console.log(err.message);
        }
    },

    shipApplesToRetailer: async function () {
        const upc = document.getElementById("upc").value;
        
        try {
            const { shipApplesToRetailer } = this.meta.methods;
            const event = await shipApplesToRetailer(upc).send({from: this.metamaskAccountID});
            $("#ftc-item").append("<br>" + "shipApplesToRetailer: UPC " + event.events.ShippedToRetailer.returnValues.upc + "<br>");
        }
        catch(err) {
            $("#ftc-item").append("<br>" + "shipApplesToRetailer: error" + "<br>");
            console.log(err.message);
        }
    },

    receiveApplesByRetailer: async function () {
        const upc = document.getElementById("upc").value;
        
        try {
            const { receiveApplesByRetailer } = this.meta.methods;
            const event = await receiveApplesByRetailer(upc).send({from: this.metamaskAccountID});
            $("#ftc-item").append("<br>" + "receiveApplesByRetailer: UPC " + event.events.ReceivedByRetailer.returnValues.upc + "<br>");
        }
        catch(err) {
            $("#ftc-item").append("<br>" + "receiveApplesByRetailer: error" + "<br>");
            console.log(err.message);
        }
    },

    onSaleApples: async function () {
        const upc = document.getElementById("upc").value;
        
        try {
            const { onSaleApples } = this.meta.methods;
            const event = await onSaleApples(upc).send({from: this.metamaskAccountID});
            $("#ftc-item").append("<br>" + "onSaleApples: UPC " + event.events.OnSale.returnValues.upc + "<br>");
        }
        catch(err) {
            $("#ftc-item").append("<br>" + "onSaleApples: error" + "<br>");
            console.log(err.message);
        }
    },

    purchaseApples: async function () {
        const upc = document.getElementById("upc").value;
        
        try {
            const { purchaseApples } = this.meta.methods;
            const event = await purchaseApples(upc).send({from: this.metamaskAccountID});
            $("#ftc-item").append("<br>" + "purchaseApples: UPC " + event.events.Purchased.returnValues.upc + "<br>");
        }
        catch(err) {
            $("#ftc-item").append("<br>" + "purchaseApples: error" + "<br>");
            console.log(err.message);
        }
    },

    fetchAppleFarmerHistory: async function () {
        const upc = document.getElementById("upc").value;
        try {
            const { fetchAppleFarmerHistory } = this.meta.methods;
            const history = await fetchAppleFarmerHistory(upc).call();

            $("#ftc-item").append('<br>Apple Farmer History<br>');
            $("#ftc-item").append('<li>' + 'Apple UPC - ' + history.upc + '</li>');
            $("#ftc-item").append('<li>' + 'Apple Batch - ' + new Date(history.batch * 1000).toLocaleDateString() + '</li>');
            $("#ftc-item").append('<li>' + 'origin Farmer ID - ' + history.originFarmerID + '</li>');
            $("#ftc-item").append('<li>' + 'origin Farm Name - ' + history.originFarmName + '</li>');
            $("#ftc-item").append('<li>' + 'origin Farm Information - ' + history.originFarmInformation + '</li>');
            $("#ftc-item").append('<li>' + 'origin Farm Latitude - ' + history.originFarmLatitude + '</li>');
            $("#ftc-item").append('<li>' + 'origin Farm Longitude - ' + history.originFarmLongitude + '</li>');
        }
        catch(err) {
            $("#ftc-item").append("<br>" + "fetchAppleFarmerHistory: error" + "<br>");
            console.log(err.message);
        }
    },

    fetchAppleHistory: async function () {
        const upc = document.getElementById("upc").value;
        try {
            const { fetchAppleHistory } = this.meta.methods;
            const history = await fetchAppleHistory(upc).call();
        
            $("#ftc-item").append('<br>Apple History<br>');
            $("#ftc-item").append('<li>' + 'Apple UPC - ' + history.upc + '</li>');
            $("#ftc-item").append('<li>' + 'Apple Batch - ' + new Date(history.batch * 1000).toLocaleDateString() + '</li>');
            $("#ftc-item").append('<li>' + 'origin Farmer ID - ' + history.originFarmerID + '</li>');
            $("#ftc-item").append('<li>' + 'DistributorID - ' + history.distributorID + '</li>');
            $("#ftc-item").append('<li>' + 'RetailerID - ' + history.retailerID + '</li>');
            $("#ftc-item").append('<li>' + 'ConsumerID - ' + history.consumerID + '</li>');
            $("#ftc-item").append('<li>' + 'Apple State - ' + history.state + '</li>');
            $("#ftc-item").append('<li>' + 'Apple State Date Changes -</li>');
            for(let i = 0; i < history.dates.length; i++) {
                $("#ftc-item").append('<li>' + new Date(history.dates[i] * 1000).toLocaleDateString() + '</li>');
            }
        }
        catch(err) {
            $("#ftc-item").append("<br>" + "fetchAppleHistory: error" + "<br>");
            console.log(err.message);
        }
    },
    
    addFarmer: async function () {
        const originFarmerID = document.getElementById("originFarmerID").value;
        try {
            const { addFarmer } = this.meta.methods;
            const event = await addFarmer(originFarmerID).send({from: this.metamaskAccountID});
            $("#ftc-item").append("<br>" + "addFarmer: " + event.events.FarmerAdded.returnValues.account + "<br>");
        }
        catch(err) {
            $("#ftc-item").append("<br>" + "addFarmer: error" + "<br>");
            console.log(err.message);
        }
    },

    addDistributor: async function () {
        const distributorID = document.getElementById("distributorID").value;
        try {
            const { addDistributor } = this.meta.methods;
            const event = await addDistributor(distributorID).send({from: this.metamaskAccountID});
            $("#ftc-item").append("<br>" + "addDistributor: " + event.events.DistributorAdded.returnValues.account + "<br>");
        }
        catch(err) {
            $("#ftc-item").append("<br>" + "addDistributor: error" + "<br>");
            console.log(err.message);
        }
    },

    addRetailer: async function () {
        const retailerID = document.getElementById("retailerID").value;
        try {
            const { addRetailer } = this.meta.methods;
            const event = await addRetailer(retailerID).send({from: this.metamaskAccountID});
            $("#ftc-item").append("<br>" + "addRetailer: " + event.events.RetailerAdded.returnValues.account + "<br>");
        }
        catch(err) {
            $("#ftc-item").append("<br>" + "addRetailer: error" + "<br>");
            console.log(err.message);
        }
    },

    addConsumer: async function () {
        const consumerID = document.getElementById("consumerID").value;
        try {
            const { addConsumer } = this.meta.methods;
            const event = await addConsumer(consumerID).send({from: this.metamaskAccountID});
            $("#ftc-item").append("<br>" + "addConsumer: " + event.events.ConsumerAdded.returnValues.account + "<br>");
        }
        catch(err) {
            $("#ftc-item").append("<br>" + "addConsumer: error" + "<br>");
            console.log(err.message);
        }
    }
};

window.App = App;

window.addEventListener("load", async function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    await window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live",);
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"),);
  }

  App.start();
});