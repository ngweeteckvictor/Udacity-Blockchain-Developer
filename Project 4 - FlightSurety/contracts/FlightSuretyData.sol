//SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

contract FlightSuretyData {
    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner; // Account used to deploy contract
    bool private operational = true; // Blocks all state changes throughout the contract if false

    enum AirlineStatus {
        UNREGISTERED,
        REGISTERED,
        PARTICIPATED
    }

    struct Airline {
        AirlineStatus status;
        uint256 fund;
        uint256 voteCount;
        string airlineName;
        mapping(address => bool) voted;
    }

    struct FlightInsurance {
        mapping(address => uint256) amount;
        mapping(address => bool) purchased;
    }

    struct Flight {
        bool isRegistered;
        uint256 updatedTimestamp;
        address airline;
        string flightNumber;
    }

    mapping(address => bool) private authorizedCallers;
    mapping(address => Airline) private airlines;

    mapping(bytes32 => Flight) private flights;
    mapping(address => bytes32[]) private flightKeys;

    mapping(bytes32 => FlightInsurance) private flightInsurances;
    mapping(bytes32 => address[]) private flightInsuranceInsurees;

    mapping(address => uint256) private creditsAmount;

    address[] private registeredAirlinesAddress;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    /********************************************************************************************/
    /*                                       CONSTRUCTOR                                        */
    /********************************************************************************************/
    /**
     * @dev Constructor
     *      The deploying account becomes contractOwner
     */
    constructor() {
        contractOwner = msg.sender;
        authorizedCallers[msg.sender] = true;
    }

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
        require(operational, "Contract is currently not operational");
        _; // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
     * @dev Modifier that requires the "ContractOwner" account to be the function caller
     */
    modifier requireContractOwner() {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireAuthorisedCaller() {
        require(authorizedCallers[msg.sender], "Caller is not authorised");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
     * @dev Get operating status of contract
     *
     * @return A bool that is the current operating status
     */
    function isOperational() external view returns (bool) {
        return operational;
    }

    /**
     * @dev Sets contract operations on/off
     *
     * When operational mode is disabled, all write transactions except for this one will fail
     */
    function setOperatingStatus(bool mode) external requireContractOwner {
        operational = mode;
    }

    function authorizeCaller(address _ContractAddress)
        external
        requireIsOperational
        requireContractOwner
    {
        authorizedCallers[_ContractAddress] = true;
    }

    function deauthorizeCaller(address _ContractAddress)
        external
        requireIsOperational
        requireContractOwner
    {
        delete authorizedCallers[_ContractAddress];
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    /**
     * @dev Add an airline to the registration queue
     *      Can only be called from FlightSuretyApp contract
     *
     */
    function registerAirline(
        string memory _airlineName,
        address _airlineAddress
    ) external requireIsOperational requireAuthorisedCaller {
        airlines[_airlineAddress].airlineName = _airlineName;
        airlines[_airlineAddress].status = AirlineStatus.REGISTERED;
        registeredAirlinesAddress.push(_airlineAddress);
    }

    /**
     * @dev Initial funding for the insurance. Unless there are too many delayed flights
     *      resulting in insurance payouts, the contract should be self-sustaining
     *
     */
    function fund(address _airlineAddress, uint256 _amount)
        external
        requireIsOperational
        requireAuthorisedCaller
    {
        airlines[_airlineAddress].status = AirlineStatus.PARTICIPATED;
        airlines[_airlineAddress].fund = _amount;
    }

    function getNumberOfRegisteredAirlines() external view returns (uint256) {
        return registeredAirlinesAddress.length;
    }

    function getRegisteredAirlinesAddress()
        external
        view
        returns (address[] memory)
    {
        return registeredAirlinesAddress;
    }

    function getAirlineName(address _airlineAddress)
        external
        view
        returns (string memory)
    {
        return airlines[_airlineAddress].airlineName;
    }

    function getAirlineStatus(address _airlineAddress)
        external
        view
        returns (AirlineStatus)
    {
        return airlines[_airlineAddress].status;
    }

    /**
     * @dev Multiparty consuensus to vote in the fifth and subsequent airlines
     *
     */
    function vote(address _voteAirlineAddress, address _votingAirlineAddress)
        external
        requireIsOperational
        requireAuthorisedCaller
    {
        airlines[_voteAirlineAddress].voteCount =
            airlines[_voteAirlineAddress].voteCount +
            1;

        airlines[_voteAirlineAddress].voted[_votingAirlineAddress] = true;
    }

    function getVoteCount(address _airlineAddress)
        external
        view
        returns (uint256)
    {
        return airlines[_airlineAddress].voteCount;
    }

    function getVoteStatus(
        address _voteAirlineAddress,
        address _votingAirlineAddress
    ) external view returns (bool) {
        return airlines[_voteAirlineAddress].voted[_votingAirlineAddress];
    }

    /**
     * @dev Register a future flight for insuring.
     *
     */
    function registerFlight(
        address _airline,
        string memory _flight,
        uint256 _timestamp
    ) external 
        requireIsOperational 
        requireAuthorisedCaller 
    {
        bytes32 _flightKey = getFlightKey(_airline, _flight, _timestamp);

        flights[_flightKey].isRegistered = true;
        flights[_flightKey].updatedTimestamp = _timestamp;
        flights[_flightKey].airline = _airline;
        flights[_flightKey].flightNumber = _flight;

        flightKeys[_airline].push(_flightKey);
    }

    function isFlightRegistered(
        address _airline,
        string memory _flight,
        uint256 _timestamp
    ) external view returns (bool _status) {
        bytes32 _flightKey = getFlightKey(_airline, _flight, _timestamp);
        return flights[_flightKey].isRegistered;
    }

    function getFlight(address _airline)
        external
        view
        returns (bytes32[] memory)
    {
        return flightKeys[_airline];
    }

    function getFlightNumber(bytes32 _flightKey)
        external
        view
        returns (string memory)
    {
        return flights[_flightKey].flightNumber;
    }

    /**
     * @dev Buy insurance for a flight
     *
     */
    function buyInsurance(
        bytes32 _flightKey,
        address _insuree,
        uint256 _amount
    ) external requireIsOperational requireAuthorisedCaller {
        flightInsuranceInsurees[_flightKey].push(_insuree);
        flightInsurances[_flightKey].amount[_insuree] = _amount;
        flightInsurances[_flightKey].purchased[_insuree] = true;
    }

    function getInsureePurchased(bytes32 _flightKey, address _insuree)
        external
        view
        returns (bool)
    {
        return flightInsurances[_flightKey].purchased[_insuree];
    }

    function getInsureeAmount(bytes32 _flightKey, address _insuree)
        external
        view
        returns (uint256)
    {
        return flightInsurances[_flightKey].amount[_insuree];
    }

    function getInsureeAddress(bytes32 _flightKey)
        external
        view
        returns (address[] memory)
    {
        return flightInsuranceInsurees[_flightKey];
    }

    /**
     *  @dev Credits payouts to insurees
     */
    function creditInsurees(
        bytes32 _flightKey,
        address _insuree,
        uint256 _amount
    ) external requireIsOperational requireAuthorisedCaller {
        creditsAmount[_insuree] = creditsAmount[_insuree] + _amount;
        delete flightInsurances[_flightKey].amount[_insuree];
        delete flightInsurances[_flightKey].purchased[_insuree];
    }

    function getCreditsAmount(address _insuree)
        external
        view
        returns (uint256)
    {
        return creditsAmount[_insuree];
    }

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
     */
    function withdrawCredits(address _insuree)
        external
        requireIsOperational
        requireAuthorisedCaller
    {
        delete creditsAmount[_insuree];
    }

    function getFlightKey(
        address airline,
        string memory flight,
        uint256 timestamp
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }
}
