'use strict';

const express = require('express');
const web3 = require('web3');
const fs = require('fs');
const router = express.Router();

// TODO: Retrieve from config file
// Preferably, read these from a config file that is not stored along with the code. 
// But since I am uploading to google firebase, it makes 0 difference security-wise.

// Contract ABI is extremely important to be able to call the functions on the smart contract.
// That being said, you can actually use the ERC20 interface abi for the generic functions.
const tokenContractAbi = JSON.parse(fs.readFileSync('./smart_contract/contract-abi.json', 'utf-8'));

const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));

console.log(config);

// Token contract address.
const tokenContractAddress = config.tokenContractAddress;
// Don't store this here in production.
const serverAccMnemonic = config.serverAccMnemonic;

// Our index page.
router.get('/', (request, response) => {

    // Cache the response to 300 seconds, this page is static content mostly.
    //response.set('Cache-Control', 'public, max-age=300, s-max-age=1800');
    response.render('index/index', {tokenContractAddress: tokenContractAddress});
});

// Get new PK takes no data and returns a pk + address.
router.get('/index/getNewPrivateKey', (request, response) => {
        // First we create a web3 instance.
        var web3Instance = new web3('https://ropsten.infura.io/');

        // We generate a new account with a Guid entropy
        var newAcc = web3Instance.eth.accounts.create("D63726BEF9454BE2ABF94300CC38F32F");

        response.json({privateKey : newAcc.privateKey, address : newAcc.address});
});

// Transfer tokens from the server's account to an address, based on the amount specified.
router.post('/index/transferTokensTo', (request, response) => {
    var web3Instance = new web3('https://ropsten.infura.io/');
    var serverAcc = web3Instance.eth.accounts.create("D63726BEF9454BE2ABF94300CC38F32F");
    var abi = "";

    var transferToAddress = request.body.address;
    var transferAmount = request.body.amount;

    response.json({});
});

// Token balance checks the token balance for the user within the address
// For implementation, you might not read from the chain, instead, read from SQL db. 
// But for demonstration purposes, I will read from chain.
router.post('/index/tokenBalance', (request, response) => {
    var web3Instance = new web3('https://ropsten.infura.io/');

    var abi = "";

    response.json({});
});

module.exports = router;