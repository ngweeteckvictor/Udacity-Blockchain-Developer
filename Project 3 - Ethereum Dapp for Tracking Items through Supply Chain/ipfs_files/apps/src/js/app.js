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
      try {
        const { web3 } = this;
        const address = "0x213d063a71BC05D0dCAF054417788Efe969305D4";
        const abi = [
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "account",
                "type": "address"
              }
            ],
            "name": "ConsumerAdded",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "account",
                "type": "address"
              }
            ],
            "name": "ConsumerRemoved",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "account",
                "type": "address"
              }
            ],
            "name": "DistributorAdded",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "account",
                "type": "address"
              }
            ],
            "name": "DistributorRemoved",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "account",
                "type": "address"
              }
            ],
            "name": "FarmerAdded",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "account",
                "type": "address"
              }
            ],
            "name": "FarmerRemoved",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": false,
                "internalType": "uint256",
                "name": "upc",
                "type": "uint256"
              }
            ],
            "name": "Harvested",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": false,
                "internalType": "uint256",
                "name": "upc",
                "type": "uint256"
              }
            ],
            "name": "OnSale",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": false,
                "internalType": "uint256",
                "name": "upc",
                "type": "uint256"
              }
            ],
            "name": "Packed",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": false,
                "internalType": "uint256",
                "name": "upc",
                "type": "uint256"
              }
            ],
            "name": "Purchased",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": false,
                "internalType": "uint256",
                "name": "upc",
                "type": "uint256"
              }
            ],
            "name": "ReceivedByDistributor",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": false,
                "internalType": "uint256",
                "name": "upc",
                "type": "uint256"
              }
            ],
            "name": "ReceivedByRetailer",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "account",
                "type": "address"
              }
            ],
            "name": "RetailerAdded",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "account",
                "type": "address"
              }
            ],
            "name": "RetailerRemoved",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": false,
                "internalType": "uint256",
                "name": "upc",
                "type": "uint256"
              }
            ],
            "name": "ShippedToDistributor",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": false,
                "internalType": "uint256",
                "name": "upc",
                "type": "uint256"
              }
            ],
            "name": "ShippedToRetailer",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "oldOwner",
                "type": "address"
              },
              {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
              }
            ],
            "name": "TransferOwnership",
            "type": "event"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "account",
                "type": "address"
              }
            ],
            "name": "addConsumer",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "account",
                "type": "address"
              }
            ],
            "name": "addDistributor",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "account",
                "type": "address"
              }
            ],
            "name": "addFarmer",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "account",
                "type": "address"
              }
            ],
            "name": "addRetailer",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "account",
                "type": "address"
              }
            ],
            "name": "isConsumer",
            "outputs": [
              {
                "internalType": "bool",
                "name": "",
                "type": "bool"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "account",
                "type": "address"
              }
            ],
            "name": "isDistributor",
            "outputs": [
              {
                "internalType": "bool",
                "name": "",
                "type": "bool"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "account",
                "type": "address"
              }
            ],
            "name": "isFarmer",
            "outputs": [
              {
                "internalType": "bool",
                "name": "",
                "type": "bool"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "isOwner",
            "outputs": [
              {
                "internalType": "bool",
                "name": "",
                "type": "bool"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "account",
                "type": "address"
              }
            ],
            "name": "isRetailer",
            "outputs": [
              {
                "internalType": "bool",
                "name": "",
                "type": "bool"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "owner",
            "outputs": [
              {
                "internalType": "address",
                "name": "",
                "type": "address"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "renounceConsumer",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "renounceDistributor",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "renounceFarmer",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "renounceOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "renounceRetailer",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
              }
            ],
            "name": "transferOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "kill",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "_upc",
                "type": "uint256"
              },
              {
                "internalType": "address",
                "name": "_originFarmerID",
                "type": "address"
              },
              {
                "internalType": "string",
                "name": "_originFarmName",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "_originFarmInformation",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "_originFarmLatitude",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "_originFarmLongitude",
                "type": "string"
              }
            ],
            "name": "harvestApples",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "_upc",
                "type": "uint256"
              }
            ],
            "name": "packApples",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "_upc",
                "type": "uint256"
              }
            ],
            "name": "shipApplesToDistributor",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "_upc",
                "type": "uint256"
              }
            ],
            "name": "receiveApplesByDistributor",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "_upc",
                "type": "uint256"
              }
            ],
            "name": "shipApplesToRetailer",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "_upc",
                "type": "uint256"
              }
            ],
            "name": "receiveApplesByRetailer",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "_upc",
                "type": "uint256"
              }
            ],
            "name": "onSaleApples",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "_upc",
                "type": "uint256"
              }
            ],
            "name": "purchaseApples",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "_upc",
                "type": "uint256"
              }
            ],
            "name": "fetchAppleFarmerHistory",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "upc",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "batch",
                "type": "uint256"
              },
              {
                "internalType": "address",
                "name": "ownerID",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "originFarmerID",
                "type": "address"
              },
              {
                "internalType": "string",
                "name": "originFarmName",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "originFarmInformation",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "originFarmLatitude",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "originFarmLongitude",
                "type": "string"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "_upc",
                "type": "uint256"
              }
            ],
            "name": "fetchAppleHistory",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "upc",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "batch",
                "type": "uint256"
              },
              {
                "internalType": "address",
                "name": "ownerID",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "originFarmerID",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "distributorID",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "retailerID",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "consumerID",
                "type": "address"
              },
              {
                "internalType": "string",
                "name": "state",
                "type": "string"
              },
              {
                "internalType": "uint256[]",
                "name": "dates",
                "type": "uint256[]"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          }
        ];

        // get contract instance
        this.meta = new web3.eth.Contract(abi, address);

          // get accounts
          const accounts = await web3.eth.getAccounts();
          this.metamaskAccountID = accounts[0];
        } catch (error) {
            console.error("Could not connect to contract or chain.");
            console.log(web3.version);
            console.log(error);
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