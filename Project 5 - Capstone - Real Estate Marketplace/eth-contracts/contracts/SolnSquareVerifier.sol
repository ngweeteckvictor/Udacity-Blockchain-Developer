//SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

// TODO define a contract call to the zokrates generated solidity contract <Verifier> or <renamedVerifier>
import "./verifier.sol";

// TODO define another contract named SolnSquareVerifier that inherits from your ERC721Mintable class
import "./ERC721Mintable.sol";

contract SolnSquareVerifier is RealEstateERC721Token {

    // TODO define a solutions struct that can hold an index & an address
    struct Solution {
        uint256 _index;
        address _address;
    }

    // TODO define an array of the above struct
    Solution[] private solution_array;

    // TODO define a mapping to store unique solutions submitted
    mapping(bytes32 => Solution) private solutions;

    // TODO Create an event to emit when a solution is added
    event SolutionAdded(uint256 _index, address _address);

    Verifier private squareVerifier;

    constructor(address squareVerifierAddress, string memory _name, string memory _symbol)
        RealEstateERC721Token(_name, _symbol)
    { 
        squareVerifier = Verifier(squareVerifierAddress);
    }

    // TODO Create a function to add the solutions to the array and emit the event
    function addSolution(uint256 _index, address _address) external {
        bytes32 key = keccak256(abi.encodePacked(_index, _address));
        solutions[key]._index = _index;
        solutions[key]._address = _address;
        solution_array.push(solutions[key]);
        emit SolutionAdded(_index, _address);
    }

    // TODO Create a function to mint new NFT only after the solution has been verified
    //  - make sure the solution is unique (has not been used before)
    //  - make sure you handle metadata as well as tokenSupply
    function mint(Verifier.Proof memory _proof, uint[2] memory _input, uint256 _index, address _address) external {
        bytes32 key = keccak256(abi.encodePacked(_index, _address)); 
        require(solutions[key]._address == address(0), "Solution exist");
        
        bool verified = squareVerifier.verifyTx(_proof, _input);
        require(verified, "Solution is not verified");

        bool _success = super.mint(_address, _index);
        require(_success, "Unable to mint new token");
    }
}
