# Project 1 - Create Your Own Private Blockchain

The application is tested using POSTMAN to make the requests to the API.

The test cases are based on the specifications given in the project rubric items.

The screenshots taken during the application testing are attached as below.

## Test Cases

1. Run your application using the command `node app.js`
You should see in your terminal a message indicating that the server is listening in port 8000:
> Server Listening for port: 8000

2. To make sure your application is working fine and it creates the Genesis Block you can use POSTMAN to request the Genesis block:
    
    ![Request: http://localhost:8000/blocks/0](/Project%201%20-%20Create%20Your%20Own%20Private%20Blockchain/Step_1_Request_Genesis_Block.jpg)

3. Make your first request of ownership sending your wallet address:
    
    ![Request: http://localhost:8000/requestValidation ](/Project%201%20-%20Create%20Your%20Own%20Private%20Blockchain/Step_2_RequestValidation.jpg)

4. Sign the message with your Wallet:
    
    ![Use the Wallet to sign a message](/Project%201%20-%20Create%20Your%20Own%20Private%20Blockchain/Step_3_Sign_Message.jpg)

5. Submit your Star:
     
     ![Request: http://localhost:8000/submitstar](/Project%201%20-%20Create%20Your%20Own%20Private%20Blockchain/Step_4_Submit_Star.jpg)

6. Request the new block:
    
    ![Request: http://localhost:8000/blocks/1](/Project%201%20-%20Create%20Your%20Own%20Private%20Blockchain/Step_5_Request_Block.jpg)

7. Retrieve Stars owned by me:
    
    ![Request: http://localhost:8000/blocks/<WALLET_ADDRESS>](/Project%201%20-%20Create%20Your%20Own%20Private%20Blockchain/Step_6_Retrieve_Stars_By_Address.jpg)

8. Validate the blockchain:
    
    ![Request: http://localhost:8000/validateChain](/Project%201%20-%20Create%20Your%20Own%20Private%20Blockchain/Step_7_ValidateChain.jpg)
    
