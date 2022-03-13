// migrating the appropriate contracts
var Verifier = artifacts.require("./verifier.sol");
var SolnSquareVerifier = artifacts.require("./SolnSquareVerifier.sol");
const Proof = require('../../zokrates/code/square/proof.json');

module.exports = async function (deployer) {
  await deployer.deploy(Verifier);
  SolnSquareVerifierContract = await deployer.deploy(SolnSquareVerifier, Verifier.address, "RealEstateToken", "RET");
  
  for (tokenId = 1; tokenId <= 10; tokenId++) {

    await SolnSquareVerifierContract.mint(
      Proof.proof,
      Proof.inputs,
      tokenId,
      "0x18bf6f1358068e57C98f57AAFD031118c868F12f"
    );
  }
};
