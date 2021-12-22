/**
 *                          Blockchain Class
 *  The Blockchain class contain the basics functions to create your own private blockchain
 *  It uses libraries like `crypto-js` to create the hashes for each block and `bitcoinjs-message` 
 *  to verify a message signature. The chain is stored in the array
 *  `this.chain = [];`. Of course each time you run the application the chain will be empty because and array
 *  isn't a persisten storage method.
 *  
 */

const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./block.js');
const bitcoinMessage = require('bitcoinjs-message');

class Blockchain {

    /**
     * Constructor of the class, you will need to setup your chain array and the height
     * of your chain (the length of your chain array).
     * Also everytime you create a Blockchain class you will need to initialized the chain creating
     * the Genesis Block.
     * The methods in this class will always return a Promise to allow client applications or
     * other backends to call asynchronous functions.
     */
    constructor() {
        this.chain = [];
        this.height = -1;
        this.initializeChain();
    }

    /**
     * This method will check for the height of the chain and if there isn't a Genesis Block it will create it.
     * You should use the `addBlock(block)` to create the Genesis Block
     * Passing as a data `{data: 'Genesis Block'}`
     */
    async initializeChain() {
        if( this.height === -1){
            let block = new BlockClass.Block({data: 'Genesis Block'});
            await this._addBlock(block);
        }
    }

    /**
     * Utility method that return a Promise that will resolve with the height of the chain
     */
    getChainHeight() {
        return new Promise((resolve, reject) => {
            resolve(this.height);
        });
    }

    /**
     * _addBlock(block) will store a block in the chain
     * @param {*} block 
     * The method will return a Promise that will resolve with the block added
     * or reject if an error happen during the execution.
     * You will need to check for the height to assign the `previousBlockHash`,
     * assign the `timestamp` and the correct `height`...At the end you need to 
     * create the `block hash` and push the block into the chain array. Don't for get 
     * to update the `this.height`
     * Note: the symbol `_` in the method name indicates in the javascript convention 
     * that this method is a private method. 
     */
    _addBlock(block) {
        let self = this;
        return new Promise(async (resolve, reject) => {
           try {
                // Validate the blockchain before adding new block
                let errorLog = await self.validateChain();
                
                // If no error found with the blockchain
                if(errorLog.length == 0) {
                    // Setting the block height
                    block.height = self.height + 1;
               
                    // Setting the block timeStamp with UTC
                    block.time = new Date().getTime().toString().slice(0,-3);                
                
                    // Checking the height to assign the previousBlockHash
                    if (self.height > -1) {
                        // Get previous block hash
                        block.previousBlockHash = self.chain[self.height].hash;
                    }
    
                    // Creating the block hash using SHA256
                    block.hash = SHA256(JSON.stringify(block)).toString();
                
                    // Adding block to chain
                    self.chain.push(block);
                
                    // Updating the height of the chain
                    self.height = block.height;
          
                    // Resolve the added block
                    resolve(block);
                }
                else {
                    // Reject with the errorLog
                    reject(new Error(errorLog));
                }
           }
           catch(ex) {
               reject(ex);
           }
        });
    }

    /**
     * The requestMessageOwnershipVerification(address) method
     * will allow you  to request a message that you will use to
     * sign it with your Bitcoin Wallet (Electrum or Bitcoin Core)
     * This is the first step before submit your Block.
     * The method return a Promise that will resolve with the message to be signed
     * @param {*} address 
     */
    requestMessageOwnershipVerification(address) {
        return new Promise((resolve) => {
            let message = `${address}:${new Date().getTime().toString().slice(0, -3)}:starRegistry`;
            resolve(message);
        });
    }

    /**
     * The submitStar(address, message, signature, star) method
     * will allow users to register a new Block with the star object
     * into the chain. This method will resolve with the Block added or
     * reject with an error.
     * Algorithm steps:
     * 1. Get the time from the message sent as a parameter example: `parseInt(message.split(':')[1])`
     * 2. Get the current time: `let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));`
     * 3. Check if the time elapsed is less than 5 minutes
     * 4. Verify the message with wallet address and signature: `bitcoinMessage.verify(message, address, signature)`
     * 5. Create the block and add it to the chain
     * 6. Resolve with the block added.
     * @param {*} address 
     * @param {*} message 
     * @param {*} signature 
     * @param {*} star 
     */
    submitStar(address, message, signature, star) {
        let self = this;
        return new Promise(async (resolve, reject) => {
            try {
                // Get the time from the message sent as a parameter 
                let messageTime = parseInt(message.split(':')[1]);

                // Get the current time
                let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));

                // Check if the time elapsed is less than 5 minutes
                if(currentTime - messageTime < (5*60)) {
                    // Verify the message with wallet address and signature
                    if(bitcoinMessage.verify(message, address, signature)) {
                        // Create the block and add it to the chain
                        let block = new BlockClass.Block({address: address, message: message, signature: signature, star: star});
                        self._addBlock(block);
                    
                        // Resolve with the block added
                        resolve(block);
                    }
                    else {
                        // Reject with an error
                        reject(new Error('The message was not signed by the wallet address'));
                    }
                }
                else {
                    // Reject with an error
                    reject(new Error('Message timed out'));
                }
            }
            catch(ex){
                reject(ex);
            }
        });
    }

    /**
     * This method will return a Promise that will resolve with the Block
     *  with the hash passed as a parameter.
     * Search on the chain array for the block that has the hash.
     * @param {*} hash 
     */
    getBlockByHash(hash) {
        let self = this;
        return new Promise((resolve, reject) => {
            let block = self.chain.filter(p =>p.hash == hash)[0];
            if(block) {
                resolve(block);
            } 
            else {
                resolve(null);
            }
        });
    }

    /**
     * This method will return a Promise that will resolve with the Block object 
     * with the height equal to the parameter `height`
     * @param {*} height 
     */
    getBlockByHeight(height) {
        let self = this;
        return new Promise((resolve, reject) => {
            let block = self.chain.filter(p => p.height === height)[0];
            if(block){
                resolve(block);
            } else {
                resolve(null);
            }
        });
    }

    /**
     * This method will return a Promise that will resolve with an array of Stars objects existing in the chain 
     * and are belongs to the owner with the wallet address passed as parameter.
     * Remember the star should be returned decoded.
     * @param {*} address 
     */
    getStarsByWalletAddress (address) {
        let self = this;
        let stars = [];
        return new Promise((resolve, reject) => {
            try {
                // Looping through the blockchain
                self.chain.forEach(async(block) => {
                    // Getting the decoded data from the block
                    let decodedData = await block.getBData();

                    // Check the owner's address with the address passed as parameter
                    if(decodedData.address == address) {
                        // if the address is the same, add the decoded star's data into the stars array
                        stars.push(decodedData);
                    }
                });

                // Return the decoded stars
                resolve(stars);
                }
                catch(ex) {
                    reject(ex);
                }
        });
    }

    /**
     * This method will return a Promise that will resolve with the list of errors when validating the chain.
     * Steps to validate:
     * 1. You should validate each block using `validateBlock`
     * 2. Each Block should check the with the previousBlockHash
     */
    validateChain() {
        let self = this;
        let errorLog = [];
        return new Promise(async (resolve, reject) => {
            try {
                // Looping through the blockchain
                self.chain.forEach(async(block) => {
                    // Check if the block has been tampered or not
                    if(!await block.validate()) {
                        // Log error if block hash is invalid
                        errorLog.push({errorMsg: 'Invalid Block Hash', height: block.height});
                    }
                    // If the block is not genesis block, check with the previous block hash to 
                    // make sure the chain isn't broken
                    if(block.height > 0) {
                        if(block.previousBlockHash != self.chain[block.height-1].hash) {
                            // Log error if the previous block hash is not the same
                            errorLog.push({errorMsg:'The chain is broken', height: block.height});
                        }
                    }
                });
                resolve(errorLog);
            }
            catch(ex) {
                reject(ex);
            }
        });
    }
}

module.exports.Blockchain = Blockchain;   