const RealEstateERC721Token = artifacts.require('RealEstateERC721Token');
const truffleAssert = require('truffle-assertions');

contract('TestERC721Mintable', accounts => {

    const name = "Real Estate Token";
    const symbol = "RET";

    const owner = accounts[0];
    const account_one = accounts[1];
    const account_two = accounts[2];

    describe('Have ownership properties', function () {
        before(async function () {
            this.contract = await RealEstateERC721Token.new(name, symbol, { from: owner });
            let result = await truffleAssert.createTransactionResult(this.contract, this.contract.transactionHash);
            truffleAssert.eventEmitted(result, 'OwnerShipTransferred', (ev) => {
                return ev.newOwner == owner;
            });
        })

        it('Should return contract owner', async function () {
            let result = await this.contract.getOwner.call();
            assert.equal(result, owner, "Incorrect owner address returned");
        })

        it('should fail when minting when address is not contract owner', async function () {
            let revert = false;

            try {
                await this.contract.mint(account_one, 1, { from: account_one });
            }
            catch (e) {
                revert = true;
            }
            assert.equal(revert, true, "Should fail minting when address is not contract owner");
        })

        it('Only contract owner can to transfer control of the contract to a newOwner', async function () {
            // Ensure that transfer control is allowed only for Contract Owner account
            let accessDenied = false;
            try {
                await this.contract.transferOwnership(account_one, { from: account_one });
            }
            catch (e) {
                accessDenied = true;
            }
            assert.equal(accessDenied, true, "Transfer control not restricted to Contract Owner");
        })

        it('Transfer control of the contract to a newOwner', async function () {
            let result = await this.contract.transferOwnership(account_one, { from: owner });
            truffleAssert.eventEmitted(result, 'OwnerShipTransferred', (ev) => {
                return ev.newOwner == account_one;
            });
        })
    });

    describe('Have pausable properties', function () {
        before(async function () {
            this.contract = await RealEstateERC721Token.new(name, symbol, { from: owner });
            let result = await truffleAssert.createTransactionResult(this.contract, this.contract.transactionHash);
            truffleAssert.eventEmitted(result, 'OwnerShipTransferred', (ev) => {
                return ev.newOwner == owner;
            });
        })

        it('Only contract owner can pause the contract', async function () {
            // Ensure that pause by only Contract Owner account
            let accessDenied = false;
            try {
                await this.contract.setPaused({ from: account_one });
            }
            catch (e) {
                accessDenied = true;
            }
            assert.equal(accessDenied, true, "Pausable not restricted to Contract Owner");
        })

        it('Contract owner pause the contract and unable to mint token', async function () {
            let result = await this.contract.setPaused({ from: owner });
            truffleAssert.eventEmitted(result, 'Paused', (ev) => {
                return ev._address == owner;
            });

            let revert = false;

            try {
                await this.contract.mint(account_one, 1, { from: owner });
            }
            catch (e) {
                revert = true;
            }
            assert.equal(revert, true, "Contract unpaused");

            let totalSupply = await this.contract.totalSupply.call();
            assert.equal(totalSupply, 0, "Token minted when contract is paused");
        })

        it('Contract owner unpause the contract and able to mint token', async function () {
            let result = await this.contract.setUnpaused({ from: owner });
            truffleAssert.eventEmitted(result, 'Unpaused', (ev) => {
                return ev._address == owner;
            });

            let revert = false;

            try {
                await this.contract.mint(account_one, 1, { from: owner });
            }
            catch (e) {
                revert = true;
            }
            assert.equal(revert, false, "Contract paused");

            let totalSupply = await this.contract.totalSupply.call();
            assert.equal(totalSupply, 1, "Token not minted when contract is unpaused");
        })
    });

    describe('Match ERC721 specifications', function () {
        before(async function () {
            this.contract = await RealEstateERC721Token.new(name, symbol, { from: owner });
            let result = await truffleAssert.createTransactionResult(this.contract, this.contract.transactionHash);
            truffleAssert.eventEmitted(result, 'OwnerShipTransferred', (ev) => {
                return ev.newOwner == owner;
            });
        })

        it('Mint multiple tokens', async function () {
            // TODO: mint multiple tokens
            let result = await this.contract.mint(account_one, 1, { from: owner });
            truffleAssert.eventEmitted(result, 'Transfer', (ev) => {
                return ev.from == 0 && ev.to == account_one && ev.tokenId == 1;
            });

            result = await this.contract.mint(account_one, 2, { from: owner });
            truffleAssert.eventEmitted(result, 'Transfer', (ev) => {
                return ev.from == 0 && ev.to == account_one && ev.tokenId == 2;
            });

            result = await this.contract.mint(account_two, 3, { from: owner });
            truffleAssert.eventEmitted(result, 'Transfer', (ev) => {
                return ev.from == 0 && ev.to == account_two && ev.tokenId == 3;
            });

            result = await this.contract.mint(account_two, 4, { from: owner });
            truffleAssert.eventEmitted(result, 'Transfer', (ev) => {
                return ev.from == 0 && ev.to == account_two && ev.tokenId == 4;
            });
        })

        it('Should return token name', async function () {
            let result = await this.contract.name.call();
            assert.equal(result, name, "Incorrect token name returned");
        })

        it('Should return token name', async function () {
            let result = await this.contract.symbol.call();
            assert.equal(result, symbol, "Incorrect token symbol returned");
        })

        // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
        it('Should return token uri', async function () {
            let uri = "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1";
            let result = await this.contract.tokenURI(1);
            assert.equal(result, uri, "Incorrect token URI returned");
        })

        it('Should get token ID at a given index of the tokens list of the requested owner', async function () {
            let tokenId = await this.contract.tokenOfOwnerByIndex(account_one, 0);
            assert.equal(tokenId, 1, "Incorrect tokenID returned");
        })

        it('Should revert as given invalid index of the tokens list of the requested owner', async function () {
            let revert = false;
            try {
                await this.contract.tokenOfOwnerByIndex(account_one, 5);
            }
            catch (e) {
                revert = true;
            }
            assert.equal(revert, true, "Function did not revert");
        })

        it('Should return total supply', async function () {
            let totalSupply = await this.contract.totalSupply.call();
            assert.equal(totalSupply, 4, "Incorrect total supply returned");
        })
        
        it('Should get the token ID at a given index of all the tokens', async function () {
            let tokenId = await this.contract.tokenByIndex(0);
            assert.equal(tokenId, 1, "Incorrect tokenID returned");
        })
        
        it('Should revert as given invalid index of all the tokens', async function () {
            let revert = false;
            try {
                await this.contract.tokenByIndex(5);
            }
            catch (e) {
                revert = true;
            }
            assert.equal(revert, true, "Function did not revert");
        })

        it('Should get token balance', async function () {
            let balance = await this.contract.balanceOf(account_one);
            assert.equal(balance, 2, "Incorrect balance returned");
        })

        it('Should get owner of tokenID', async function () {
            let owner = await this.contract.ownerOf(1);
            assert.equal(owner, account_one, "Incorrect token owner returned");
        })

        it('Should approves another address to transfer the given token ID', async function () { 
            let success = await this.contract.approve(account_two, 1, {from:owner});
            truffleAssert.eventEmitted(success, 'Approval');

            let result = await this.contract.getApproved(1);
            assert.equal(result, account_two, "Incorrect token approval returned");
        })
        
        it('Should transfer token from one owner to another', async function () { 
            let success = await this.contract.transferFrom(account_one, account_two, 2, {from:account_one});
            truffleAssert.eventEmitted(success, 'Transfer');

            let account_one_balance = await this.contract.balanceOf(account_one);
            assert.equal(account_one_balance, 1, "Incorrect balance returned");

            let account_two_balance = await this.contract.balanceOf(account_two);
            assert.equal(account_two_balance, 3, "Incorrect balance returned");

            let owner = await this.contract.ownerOf(2);
            assert.equal(owner, account_two, "Incorrect token owner returned");
        })
                
        it('Should transfer token from one approved address to another owner', async function () { 
            let success = await this.contract.transferFrom(account_one, account_two, 1, {from:account_two});
            truffleAssert.eventEmitted(success, 'Transfer');

            let account_one_balance = await this.contract.balanceOf(account_one);
            assert.equal(account_one_balance, 0, "Incorrect balance returned");

            let account_two_balance = await this.contract.balanceOf(account_two);
            assert.equal(account_two_balance, 4, "Incorrect balance returned");

            let owner = await this.contract.ownerOf(1);
            assert.equal(owner, account_two, "Incorrect token owner returned");
        })
    });
})