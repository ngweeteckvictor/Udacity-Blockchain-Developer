// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within
// Declare a variable and assign the compiled smart contract artifact
const SupplyChain = artifacts.require('SupplyChain');
const truffleAssert = require('truffle-assertions');

contract('SupplyChain', function(accounts) {
    // Declare few constants and assign a few sample accounts generated by ganache-cli
    var upc = 1;
    const ownerID = accounts[0];
    const originFarmerID = accounts[1];
    const originFarmName = "John Doe";
    const originFarmInformation = "Yarray Valley";
    const originFarmLatitude = "-38.239770";
    const originFarmLongitude = "144.341490";
    const distributorID = accounts[2];
    const retailerID = accounts[3];
    const consumerID = accounts[4];
    const emptyAddress = '0x0000000000000000000000000000000000000000';

    const state = [
        "Harvested",
        "Packed",
        "Shipped To Distributor",
        "Received By Distributor",
        "Shipped To Retailer",
        "Received By Retailer",
        "On Sale",
        "Purchased"
    ];

    console.log("ganache-cli accounts used here...");
    console.log("Contract Owner: accounts[0] ", accounts[0]);
    console.log("Farmer: accounts[1] ", accounts[1]);
    console.log("Distributor: accounts[2] ", accounts[2]);
    console.log("Retailer: accounts[3] ", accounts[3]);
    console.log("Consumer: accounts[4] ", accounts[4]);

    // Test Case #1
    it("Testing to add roles into the smart contract", async() => {
        let supplyChain = await SupplyChain.deployed();

        let owner =  await supplyChain.owner();
        assert.equal(owner, ownerID, 'Error: Invalid ownerID');
        
        let farmerAddedEvent =  await supplyChain.addFarmer(originFarmerID);
        truffleAssert.eventEmitted(farmerAddedEvent, "FarmerAdded");
        
        let distributorAddedEvent = await supplyChain.addDistributor(distributorID);
        truffleAssert.eventEmitted(distributorAddedEvent, "DistributorAdded");

        let retailerAddedEvent = await supplyChain.addRetailer(retailerID);
        truffleAssert.eventEmitted(retailerAddedEvent, "RetailerAdded");

        let consumerAddedEvent = await supplyChain.addConsumer(consumerID);      
        truffleAssert.eventEmitted(consumerAddedEvent, "ConsumerAdded");
    });

    // Test Case #2
    it("Testing smart contract function harvestApples() that allows a farmer to harvest apples", async() => {
        let supplyChain = await SupplyChain.deployed();
        
        // Mark apples as Harvested by calling function harvestApples()
        let HarvestedEvent = await supplyChain.harvestApples(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, {from:originFarmerID});

        // Retrieve the saved data from blockchain by calling function fetchAppleFarmerHistory() and fetchAppleHistory()
        let appleFarmerHistory = await supplyChain.fetchAppleFarmerHistory.call(upc);
        let appleHistory = await supplyChain.fetchAppleHistory.call(upc);

        // Verify the result set
        assert.equal(appleFarmerHistory[0], upc, 'Error: Invalid item UPC');
        console.log("Apple Farmer Batch Number: ", new Date(appleFarmerHistory[1] * 1000).toLocaleDateString());
        assert.equal(appleFarmerHistory[2], originFarmerID, 'Error: Missing or Invalid ownerID');
        assert.equal(appleFarmerHistory[3], originFarmerID, 'Error: Missing or Invalid originFarmerID');
        assert.equal(appleFarmerHistory[4], originFarmName, 'Error: Missing or Invalid originFarmName');
        assert.equal(appleFarmerHistory[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation');
        assert.equal(appleFarmerHistory[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude');
        assert.equal(appleFarmerHistory[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude');

        assert.equal(appleHistory[0], upc, 'Error: Invalid item UPC');
        console.log("Apple History Batch Number: ", new Date(appleHistory[1] * 1000).toLocaleDateString());
        assert.equal(appleHistory[2], originFarmerID, 'Error: Missing or Invalid ownerID');
        assert.equal(appleHistory[3], originFarmerID, 'Error: Missing or Invalid originFarmerID');
        assert.equal(appleHistory[4], emptyAddress, 'Error: distributorID should be 0');
        assert.equal(appleHistory[5], emptyAddress, 'Error: retailerID should be 0');
        assert.equal(appleHistory[6], emptyAddress, 'Error: consumerID should be 0');
        assert.equal(appleHistory[7], state[0], 'Error: Invalid apple State');
        for(let i = 0; i < appleHistory[8].length; i++) {
            console.log(state[i] + " Dates:", new Date(appleHistory[8][i] * 1000).toLocaleDateString());
        }

        truffleAssert.eventEmitted(HarvestedEvent, "Harvested");
    });

    // Test Case #3
    it("Testing smart contract function packApples() that allows a farmer to pack apples", async() => {
        let supplyChain = await SupplyChain.deployed();
        
        // Mark apples as Packed by calling function packApples()
        let PackedEvent = await supplyChain.packApples(upc, {from:originFarmerID});

        // Retrieve the saved data from blockchain by calling function fetchAppleHistory()
        let appleHistory = await supplyChain.fetchAppleHistory.call(upc);

        // Verify the result set
        assert.equal(appleHistory[7], state[1], 'Error: Invalid apple State');
        for(let i = 0; i < appleHistory[8].length; i++) {
            console.log(state[i] + " Dates:", new Date(appleHistory[8][i] * 1000).toLocaleDateString());
        }

        truffleAssert.eventEmitted(PackedEvent, "Packed");
    });

    // Test Case #4
    it("Testing smart contract function shipApplesToDistributor() that allows a farmer to ship apples to distributor", async() => {
        let supplyChain = await SupplyChain.deployed();
        
        // Mark apples as ShippedToDistributor by calling function ShipApplesToDistributor()
        let ShippedToDistributorEvent = await supplyChain.shipApplesToDistributor(upc, {from:originFarmerID});

        // Retrieve the saved data from blockchain by calling function fetchAppleHistory()
        let appleHistory = await supplyChain.fetchAppleHistory.call(upc);

        // Verify the result set
        assert.equal(appleHistory[7], state[2], 'Error: Invalid apple State');
        for(let i = 0; i < appleHistory[8].length; i++) {
            console.log(state[i] + " Dates:", new Date(appleHistory[8][i] * 1000).toLocaleDateString());
        }

        truffleAssert.eventEmitted(ShippedToDistributorEvent, "ShippedToDistributor");
    });

    // Test Case #5
    it("Testing smart contract function receiveApplesByDistributor() that allows a distributor to acknowledge apples received", async() => {
        let supplyChain = await SupplyChain.deployed();
        
        // Mark apples as ReceivedByDistributor by calling function receiveApplesByDistributor()
        let ReceivedByDistributorEvent = await supplyChain.receiveApplesByDistributor(upc, {from:distributorID});

        // Retrieve the saved data from blockchain by calling function fetchAppleHistory()
        let appleHistory = await supplyChain.fetchAppleHistory.call(upc);

        // Verify the result set
        assert.equal(appleHistory[2], distributorID, 'Error: Missing or Invalid ownerID');
        assert.equal(appleHistory[4], distributorID, 'Error: Missing or Invalid distributorID');
        assert.equal(appleHistory[7], state[3], 'Error: Invalid apple State');
        for(let i = 0; i < appleHistory[8].length; i++) {
            console.log(state[i] + " Dates:", new Date(appleHistory[8][i] * 1000).toLocaleDateString());
        }
        
        truffleAssert.eventEmitted(ReceivedByDistributorEvent, "ReceivedByDistributor");
    });

    // Test Case #6
    it("Testing smart contract function shipApplesToRetailer() that allows a distributor to ship apples to retailer", async() => {
        let supplyChain = await SupplyChain.deployed();
        
        // Mark apples as ShippedToRetailer by calling function shipApplesToRetailer()
        let ShippedToRetailerEvent = await supplyChain.shipApplesToRetailer(upc, {from:distributorID});

        // Retrieve the saved data from blockchain by calling function fetchAppleHistory()
        let appleHistory = await supplyChain.fetchAppleHistory.call(upc);

        // Verify the result set
        assert.equal(appleHistory[7], state[4], 'Error: Invalid apple State');
        for(let i = 0; i < appleHistory[8].length; i++) {
            console.log(state[i] + " Dates:", new Date(appleHistory[8][i] * 1000).toLocaleDateString());
        }
        
        truffleAssert.eventEmitted(ShippedToRetailerEvent, "ShippedToRetailer");
    });

    // Test Case #7
    it("Testing smart contract function receiveApplesByRetailer() that allows a retailer to acknowledge apples received", async() => {
        let supplyChain = await SupplyChain.deployed();
        
        // Mark apples as ReceivedByRetailer by calling function receiveApplesByRetailer()
        let ReceivedByRetailerEvent = await supplyChain.receiveApplesByRetailer(upc, {from:retailerID});

        // Retrieve the saved data from blockchain by calling function fetchAppleHistory()
        let appleHistory = await supplyChain.fetchAppleHistory.call(upc);

        // Verify the result set
        assert.equal(appleHistory[2], retailerID, 'Error: Missing or Invalid ownerID');
        assert.equal(appleHistory[5], retailerID, 'Error: Missing or Invalid retailerID');
        assert.equal(appleHistory[7], state[5], 'Error: Invalid apple State');
        for(let i = 0; i < appleHistory[8].length; i++) {
            console.log(state[i] + " Dates:", new Date(appleHistory[8][i] * 1000).toLocaleDateString());
        }
        
        truffleAssert.eventEmitted(ReceivedByRetailerEvent, "ReceivedByRetailer");
    });    

    // Test Case #8
    it("Testing smart contract function onSaleApples() that allows a retailer to sell the apples", async() => {
        let supplyChain = await SupplyChain.deployed();
        
        // Mark apples as OnSale by calling function onSaleApples()
        let OnSaleEvent = await supplyChain.onSaleApples(upc, {from:retailerID});

        // Retrieve the saved data from blockchain by calling function fetchAppleHistory()
        let appleHistory = await supplyChain.fetchAppleHistory.call(upc);

        // Verify the result set
        assert.equal(appleHistory[7], state[6], 'Error: Invalid apple State');
        for(let i = 0; i < appleHistory[8].length; i++) {
            console.log(state[i] + " Dates:", new Date(appleHistory[8][i] * 1000).toLocaleDateString());
        }
        
        truffleAssert.eventEmitted(OnSaleEvent, "OnSale");
    });    

    // Test Case #9
    it("Testing smart contract function purchaseApples() that allows a consumer to buy the apples", async() => {
        let supplyChain = await SupplyChain.deployed();
        
        // Mark apples as Purchased by calling function purchaseApples()
        let PurchasedEvent = await supplyChain.purchaseApples(upc, {from:consumerID});

        // Retrieve the saved data from blockchain by calling function fetchAppleFarmerHistory() and fetchAppleHistory()
        let appleFarmerHistory = await supplyChain.fetchAppleFarmerHistory.call(upc);
        let appleHistory = await supplyChain.fetchAppleHistory.call(upc);

        // Verify the result set
        assert.equal(appleFarmerHistory[0], upc, 'Error: Invalid item UPC');
        console.log("Apple Farmer Batch Number: ", new Date(appleFarmerHistory[1] * 1000).toLocaleDateString());
        assert.equal(appleFarmerHistory[2], consumerID, 'Error: Missing or Invalid ownerID');
        assert.equal(appleFarmerHistory[3], originFarmerID, 'Error: Missing or Invalid originFarmerID');
        assert.equal(appleFarmerHistory[4], originFarmName, 'Error: Missing or Invalid originFarmName');
        assert.equal(appleFarmerHistory[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation');
        assert.equal(appleFarmerHistory[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude');
        assert.equal(appleFarmerHistory[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude');

        assert.equal(appleHistory[0], upc, 'Error: Invalid item UPC');
        console.log("Apple History Batch Number: ", new Date(appleHistory[1] * 1000).toLocaleDateString());
        assert.equal(appleHistory[2], consumerID, 'Error: Missing or Invalid ownerID');
        assert.equal(appleHistory[3], originFarmerID, 'Error: Missing or Invalid originFarmerID');
        assert.equal(appleHistory[4], distributorID, 'Error: Missing or Invalid distributorID');
        assert.equal(appleHistory[5], retailerID, 'Error: Missing or Invalid retailerID');
        assert.equal(appleHistory[6], consumerID, 'Error: Missing or Invalid consumerID');
        assert.equal(appleHistory[7], state[7], 'Error: Invalid apple State');
        for(let i = 0; i < appleHistory[8].length; i++) {
            console.log(state[i] + " Dates:", new Date(appleHistory[8][i] * 1000).toLocaleDateString());
        }
        
        truffleAssert.eventEmitted(PurchasedEvent, "Purchased");
    });        
});

