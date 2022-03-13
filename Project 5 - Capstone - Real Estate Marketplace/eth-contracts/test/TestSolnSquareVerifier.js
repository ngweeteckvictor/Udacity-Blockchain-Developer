// Test if a new solution can be added for contract - SolnSquareVerifier
const SolnSquareVerifier = artifacts.require('SolnSquareVerifier');
const Verifier = artifacts.require('Verifier');
const Proof = require('../../zokrates/code/square/proof.json');
const truffleAssert = require('truffle-assertions');

contract('SolnSquareVerifier', accounts => {

    const owner = accounts[0];
    const account_one = accounts[1];

    const name = "Real Estate Token";
    const symbol = "RET";

    describe('Test Solution Square verifier', function () {

        beforeEach(async function () {
            this.contract = await SolnSquareVerifier.new(Verifier.address, name, symbol, { from: owner });
        })

        it('Should add the solution', async function () {
            let result = await this.contract.addSolution(1, account_one);
            truffleAssert.eventEmitted(result, 'SolutionAdded', (ev) => {
                return ev._index == 1 && ev._address == account_one;
            });
        })

        // Test if an ERC721 token can be minted for contract - SolnSquareVerifier
        it('Should new ERC721 token be minted', async function () {
            let revert = false;
            try {
                await this.contract.mint(Proof.proof, Proof.inputs, 1, account_one);
            }
            catch(e) {
                revert = true;
            }
            assert.equal(revert, false, "Function reverted");
        })

        it('Should revert due to solution exist', async function () {
            let revert = false;
            try {
                await this.contract.addSolution(1, account_one);
                await this.contract.mint(Proof.proof, Proof.inputs, 1, account_one);
            }
            catch(e) {
                revert = true;
            }
            assert.equal(revert, true, "Function reverted");
        })

        it('Should revert due to solution not verified', async function () {
            let revert = false;
            try {
                await this.contract.addSolution(1, account_one);
                await this.contract.mint(Proof.proof, [10, 1], 1, account_one);
            }
            catch(e) {
                revert = true;
            }
            assert.equal(revert, true, "Function reverted");
        })
    });
})