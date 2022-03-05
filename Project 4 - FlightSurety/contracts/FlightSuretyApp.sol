//SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "./FlightSuretyData.sol";

/************************************************** */
/* FlightSurety Smart Contract                      */
/************************************************** */
contract FlightSuretyApp {
    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    uint8 private constant fundingAmount = 10;

    address private contractOwner; // Account used to deploy contract

    FlightSuretyData private flightSuretyData;

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
     * @dev Modifier that requires the "operational" boolean variable to be "true"
     *      This is used on all state changing functions to pause the contract in
     *      the event there is an issue that needs to be fixed
     */
    modifier requireIsOperational() {
        // Modify to call data contract's status
        require(
            flightSuretyData.isOperational(),
            "Contract is currently not operational"
        );
        _; // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
     * @dev Modifier that requires the "ContractOwner" account to be the function caller
     */
    modifier requireContractOwner() {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    event AirlineStatusEvent(
        address _airlineAddress,
        FlightSuretyData.AirlineStatus _status
    );

    event AirlineVotedEvent(
        address _voteAirlineAddress,
        address _votingAirlineAddress,
        bool _success
    );

    event FlightRegisteredEvent(
        address _airlineAddress,
        string _flight,
        uint256 _timestamp,
        bool _success
    );

    event BuyFlightInsurance(
        bytes32 _flightKey,
        address _passenger,
        uint256 _amount
    );

    event CreditInsuree(address _insuree, uint256 _amount);

    event WithdrawCredits(address _insuree);

    /********************************************************************************************/
    /*                                       CONSTRUCTOR                                        */
    /********************************************************************************************/

    /**
     * @dev Contract constructor
     *
     */
    constructor(address _dataAddress) {
        contractOwner = msg.sender;
        flightSuretyData = FlightSuretyData(_dataAddress);
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    function isOperational() external view returns (bool) {
        return flightSuretyData.isOperational(); // Modify to call data contract's status
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    /**
     * Add an airline to the registration queue
     *
     */
    function registerAirline(
        string memory _airlineName,
        address _airlineAddress
    ) external requireIsOperational {
        // require valid new airline address
        require(_airlineAddress != address(0), "Invalid airline's address");

        // require new airline is not register
        require(
            flightSuretyData.getAirlineStatus(_airlineAddress) ==
                FlightSuretyData.AirlineStatus.UNREGISTERED,
            "Airline has already registered"
        );

        // require only existing participated airline may register a new airline
        require(
            flightSuretyData.getAirlineStatus(msg.sender) ==
                FlightSuretyData.AirlineStatus.PARTICIPATED,
            "Caller airline has not participated"
        );

        if (flightSuretyData.getNumberOfRegisteredAirlines() < 4) {
            flightSuretyData.registerAirline(_airlineName, _airlineAddress);
        } else {
            uint256 votes = flightSuretyData.getVoteCount(_airlineAddress);
            uint256 voteRequired = (flightSuretyData
                .getNumberOfRegisteredAirlines() + 1) / 2;

            require(
                votes >= voteRequired,
                "Not enough consensus to register airline"
            );
            flightSuretyData.registerAirline(_airlineName, _airlineAddress);
        }
        emit AirlineStatusEvent(
            _airlineAddress,
            FlightSuretyData.AirlineStatus.REGISTERED
        );
    }

    /**
     * an airline to initial funding for the insurance
     *
     */
    function fund(address _airlineAddress)
        external
        payable
        requireIsOperational
    {
        require(
            flightSuretyData.getAirlineStatus(_airlineAddress) ==
                FlightSuretyData.AirlineStatus.REGISTERED,
            "Airline is not registered"
        );

        // require airline to submit the correct funding
        require(msg.value == (fundingAmount * 1 ether), "Insufficient fund");

        emit AirlineStatusEvent(
            _airlineAddress,
            FlightSuretyData.AirlineStatus.PARTICIPATED
        );

        flightSuretyData.fund(_airlineAddress, msg.value);
    }

    /**
     * @dev Multiparty consuensus to vote in the fifth and subsequent airlines
     *
     */
    function vote(address _voteAirlineAddress) external requireIsOperational {
        // require valid airline address to vote
        require(_voteAirlineAddress != address(0), "Invalid airline's address");

        // require only existing participated airline may vote for a new airline
        require(
            flightSuretyData.getAirlineStatus(msg.sender) ==
                FlightSuretyData.AirlineStatus.PARTICIPATED,
            "Voting airline has not funded"
        );

        require(
            !flightSuretyData.getVoteStatus(_voteAirlineAddress, msg.sender),
            "Duplicate vote"
        );

        emit AirlineVotedEvent(_voteAirlineAddress, msg.sender, true);

        flightSuretyData.vote(_voteAirlineAddress, msg.sender);
    }

    /**
     * @dev Register a future flight for insuring.
     *
     */
    function registerFlight(
        address _airline,
        string memory _flight,
        uint256 _timestamp
    ) external requireIsOperational {
        require(
            _airline == msg.sender,
            "Flight must be register by the airline"
        );

        require(
            !flightSuretyData.isFlightRegistered(_airline, _flight, _timestamp),
            "Duplicate flight"
        );

        emit FlightRegisteredEvent(_airline, _flight, _timestamp, true);

        flightSuretyData.registerFlight(_airline, _flight, _timestamp);
    }

    /**
     * @dev Buy insurance for a flight
     *
     */
    function buyFlightInsurance(
        address _airline,
        string memory _flight,
        uint256 timestamp,
        address _insuree
    ) external payable requireIsOperational {
        require(_insuree != address(0), "Invalid insuree's address");
        require(msg.value <= 1 ether, "Premium exceeded 1 Ether");

        bytes32 _flightKey = getFlightKey(_airline, _flight, timestamp);

        require(
            !flightSuretyData.getInsureePurchased(_flightKey, _insuree),
            "Duplicate purchase is not allowed"
        );

        emit BuyFlightInsurance(_flightKey, _insuree, msg.value);

        flightSuretyData.buyInsurance(_flightKey, _insuree, msg.value);
    }

    /**
     *  @dev Credits payouts to insurees
     */
    function creditInsurees(bytes32 _flightKey, address _insuree) internal {
        uint256 _amount = flightSuretyData.getInsureeAmount(
            _flightKey,
            _insuree
        );
        _amount = (_amount * 3) / 2;
        emit CreditInsuree(_insuree, _amount);

        flightSuretyData.creditInsurees(_flightKey, _insuree, _amount);
    }

    function getCreditsAmount(address _insuree)
        public
        view
        returns (uint256 _creditsAmount)
    {
        _creditsAmount = flightSuretyData.getCreditsAmount(_insuree);
    }

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
     */
    function withdrawCredits() external requireIsOperational {
        require(
            getCreditsAmount(msg.sender) != 0,
            "There is no credit for withdraw"
        );

        emit WithdrawCredits(msg.sender);

        flightSuretyData.withdrawCredits(msg.sender);

        (bool success, ) = msg.sender.call{value: getCreditsAmount(msg.sender)}("");
        require(success, "unable to send credits to insuree");
    }

    /**
     * @dev Called after oracle has updated flight status
     *
     */
    function processFlightStatus(
        address airline,
        string memory flight,
        uint256 timestamp,
        uint8 status
    ) internal requireIsOperational {
        if (status == STATUS_CODE_LATE_AIRLINE) {
            bytes32 _flightKey = getFlightKey(airline, flight, timestamp);

            address[] memory _insuree = flightSuretyData.getInsureeAddress(
                _flightKey
            );

            //credit insurees
            for (uint256 idx = 0; idx < _insuree.length; idx++) {
                creditInsurees(_flightKey, _insuree[idx]);
            }
        }
    }

    // Generate a request for oracles to fetch flight information
    function fetchFlightStatus(
        address airline,
        string memory flight,
        uint256 timestamp
    ) external {
        uint8 index = getRandomIndex(msg.sender);

        // Generate a unique key for storing the request
        bytes32 key = keccak256(
            abi.encodePacked(index, airline, flight, timestamp)
        );
        ResponseInfo storage r = oracleResponses[key];
        r.requester = msg.sender;
        r.isOpen = true;

        emit OracleRequest(index, airline, flight, timestamp);
    }

    // region ORACLE MANAGEMENT

    // Incremented to add pseudo-randomness at various points
    uint8 private nonce = 0;

    // Fee to be paid when registering oracle
    uint256 public constant REGISTRATION_FEE = 1 ether;

    // Number of oracles that must respond for valid status
    uint256 private constant MIN_RESPONSES = 3;

    // Flight status codees
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;

    struct Oracle {
        bool isRegistered;
        uint8[3] indexes;
    }

    // Track all registered oracles
    mapping(address => Oracle) private oracles;

    // Model for responses from oracles
    struct ResponseInfo {
        address requester; // Account that requested status
        bool isOpen; // If open, oracle responses are accepted
        mapping(uint8 => address[]) responses; // Mapping key is the status code reported
        // This lets us group responses and identify
        // the response that majority of the oracles
    }

    // Track all oracle responses
    // Key = hash(index, flight, timestamp)
    mapping(bytes32 => ResponseInfo) private oracleResponses;

    // Event fired each time an oracle submits a response
    event FlightStatusInfo(
        address airline,
        string flight,
        uint256 timestamp,
        uint8 status
    );

    event OracleReport(
        address airline,
        string flight,
        uint256 timestamp,
        uint8 status
    );

    // Event fired when flight status request is submitted
    // Oracles track this and if they have a matching index
    // they fetch data and submit a response
    event OracleRequest(
        uint8 index,
        address airline,
        string flight,
        uint256 timestamp
    );

    // Register an oracle with the contract
    function registerOracle() external payable {
        // Require registration fee
        require(msg.value >= REGISTRATION_FEE, "Registration fee is required");

        //uint8[3] memory indexes = generateIndexes(msg.sender);
        oracles[msg.sender].isRegistered = true;
        oracles[msg.sender].indexes = generateIndexes(msg.sender);
    }

    function getMyIndexes() external view returns (uint8[3] memory) {
        require(
            oracles[msg.sender].isRegistered,
            "Not registered as an oracle"
        );

        return oracles[msg.sender].indexes;
    }

    // Called by oracle when a response is available to an outstanding request
    // For the response to be accepted, there must be a pending request that is open
    // and matches one of the three Indexes randomly assigned to the oracle at the
    // time of registration (i.e. uninvited oracles are not welcome)
    function submitOracleResponse(
        uint8 index,
        address airline,
        string memory flight,
        uint256 timestamp,
        uint8 statusCode
    ) external {
        require(
            (oracles[msg.sender].indexes[0] == index) ||
                (oracles[msg.sender].indexes[1] == index) ||
                (oracles[msg.sender].indexes[2] == index),
            "Index does not match oracle request"
        );

        bytes32 key = keccak256(
            abi.encodePacked(index, airline, flight, timestamp)
        );
        require(
            oracleResponses[key].isOpen,
            "Flight or timestamp do not match oracle request"
        );

        oracleResponses[key].responses[statusCode].push(msg.sender);

        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
        emit OracleReport(airline, flight, timestamp, statusCode);
        if (
            oracleResponses[key].responses[statusCode].length >= MIN_RESPONSES
        ) {
            oracleResponses[key].isOpen = false;
            emit FlightStatusInfo(airline, flight, timestamp, statusCode);

            // Handle flight status as appropriate
            processFlightStatus(airline, flight, timestamp, statusCode);
        }
    }

    function getFlightKey(
        address airline,
        string memory flight,
        uint256 timestamp
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    // Returns array of three non-duplicating integers from 0-9
    function generateIndexes(address account)
        internal
        returns (uint8[3] memory)
    {
        uint8[3] memory indexes;
        indexes[0] = getRandomIndex(account);

        indexes[1] = indexes[0];
        while (indexes[1] == indexes[0]) {
            indexes[1] = getRandomIndex(account);
        }

        indexes[2] = indexes[1];
        while ((indexes[2] == indexes[0]) || (indexes[2] == indexes[1])) {
            indexes[2] = getRandomIndex(account);
        }

        return indexes;
    }

    // Returns array of three non-duplicating integers from 0-9
    function getRandomIndex(address account) internal returns (uint8) {
        uint8 maxValue = 10;

        // Pseudo random number...the incrementing nonce adds variation
        uint8 random = uint8(
            uint256(
                keccak256(
                    abi.encodePacked(blockhash(block.number - nonce++), account)
                )
            ) % maxValue
        );

        if (nonce > 250) {
            nonce = 0; // Can only fetch blockhashes for last 256 blocks so we adapt
        }

        return random;
    }

    // endregion

    fallback() external payable {}

    receive() external payable {}
}
