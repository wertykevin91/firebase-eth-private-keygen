'use strict';

// Node stuff
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Eth stuff
const web3 = require('web3');
const bip39 = require('bip39');
const hdkey = require('hdkey');
const ethUtil = require('ethereumjs-util');

// Preferably, read these from a config file that is not stored along with the code. 
// But since I am uploading to google firebase, it makes 0 difference security-wise.

// Contract ABI is extremely important to be able to call the functions on the smart contract.
// That being said, you can actually use the ERC20 interface abi for the generic functions.
const tokenContractAbi = JSON.parse(fs.readFileSync(path.join(__dirname, '../smart_contract/contract-abi.json'), 'utf-8'));

const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json'), 'utf-8'));

// Token contract address.
const tokenContractAddress = config.tokenContractAddress;
// Don't store this here in production.
const serverAccMnemonic = config.serverAccMnemonic;

// Our index page.
router.get('/', (request, response) => {

    // Cache the response to 300 seconds, this page is static content mostly.
    response.set('Cache-Control', 'public, max-age=300, s-max-age=1800');
    response.render('index/index', {tokenContractAddress: tokenContractAddress});
});

// Get new PK takes no data and returns a pk + address.
router.get('/index/getNewPrivateKey', (request, response) => {
    // First we create a web3 instance.
    const web3Instance = new web3('https://ropsten.infura.io/');

    // We generate a new account with a Guid entropy
    const newAcc = web3Instance.eth.accounts.create("D63726BEF9454BE2ABF94300CC38F32F");

    response.json({privateKey : newAcc.privateKey, address : newAcc.address});
});

// Token balance checks the token balance for the user within the address
// For implementation, you might not read from the chain, instead, read from SQL db. 
// But for demonstration purposes, I will read from chain.
// This will effectively show you how to call "view" functions from the ethereum blockchain
router.post('/index/tokenBalance', (request, response) => {
    const web3Instance = new web3('https://ropsten.infura.io/');

    // get address parameter from the user
    const address = request.body.address;

    // ensure address not null
    if(address === null || address === "")
    {
        response.json({error: "No address found"});
    }

    var contract = new web3Instance.eth.Contract(tokenContractAbi, tokenContractAddress);

    // How many decimals does the coin have? Standard erc20 has 18
    var decimals = 0;
    // What is the user's balance
    var balance = null;

    // Remember, calls returns promises.
    contract.methods.decimals().call().then((a) =>{
        // I know that in general the number is 18 so I don't use BN here.
        decimals = a;
        return contract.methods.balanceOf(address).call();
    }).then((a)=> {
        // I am unsure of how safe the numbers will be here if you dont use BN.
        // Always use BN (BigNumber) for this kind of calculation in javascript directly due to the size of numbers in ethereum.

        // Create and calculate only in BigNumber
        balance = web3Instance.utils.toBN(a).div(web3Instance.utils.toBN(Math.pow(10, decimals)));
        response.json({balance: balance.toString()});
        return;
    }).catch(() =>{
        response.json({error: "Unable to retrive balance for " + address});
    });
});

// Transfer tokens from the server's account to an address, based on the amount specified.
// This will be by far the hardest one yet.
// I will be calling infura and not my own parity/geth node, which means the web3 instance it is pointed to has no wallet by default.
// Steps:
// 1. Initialize a wallet with my existing keys
// 2. Create a transaction
// 3. Sign the transaction with the wallet's private keys
// 4. Broadcast the raw tx to infura
// 5. Return the transaction hash to the user
router.post('/index/transferTokensTo', (request, response) => {
    const web3Instance = new web3('https://ropsten.infura.io/');

    const transferToAddress = request.body.address;
    const transferAmount = request.body.amount;

    // ensure address not null
    if(transferToAddress === null || transferToAddress === "")
    {
        response.json({error: "No address found."});
    }

    if(transferAmount > 100000 || transferAmount < 0)
    {
        response.json({error: "Invalid amount."});
    }

    const contract = new web3Instance.eth.Contract(tokenContractAbi, tokenContractAddress);

    // Decimal numbers in the contract. Most of the time it is more practical to store in db. But I am just demo-ing
    var decimals = 0;
    // Current token balance of the server
    var currentBalance = null;
    // Nonce count of the server account. nonce will increase by 1 for every transaction made from this account
    var txCount = 0;

    // Transaction hash for the user
    var txHash = null;

    // 1
    // https://medium.com/bitcraft/so-you-want-to-build-an-ethereum-hd-wallet-cb2b7d7e4998

    const seed = bip39.mnemonicToSeed(serverAccMnemonic);
    const root = hdkey.fromMasterSeed(seed);
    const masterPrivateKey = root.privateKey.toString("hex");

    const addrNode = root.derive("m/44'/60'/0'/0/0"); //line 1
    const publicKey = ethUtil.privateToPublic(addrNode._privateKey);
    const privateKey = ethUtil.bufferToHex(addrNode._privateKey);
    

    const addr = ethUtil.publicToAddress(publicKey).toString('hex');
    const address = ethUtil.toChecksumAddress(addr);

    // 2 
    
    // Get nonce
    web3Instance.eth.getTransactionCount(address).then((count) => {
        txCount = count;

        // Get decimal
        return contract.methods.decimals().call();
    }).then((a)=>{
        decimals = a;

        // Get current balance of server
        return contract.methods.balanceOf(address).call();
    }).then((b)=>{
        // Remember what we did at check balance?
        currentBalance = web3Instance.utils.toBN(b).div(web3Instance.utils.toBN(Math.pow(10, decimals)));

        // Guarantee that the server actually has balance to send
        if(currentBalance.lt(web3.utils.toBN(transferAmount)))
        {
            response.json({error: "Insufficient Balance"});
        }

        // Wowee this far and we have not even started making the transaction yet

        // gotta account for that big number
        var transferAmountBN = web3.utils.toBN(transferAmount).mul(web3Instance.utils.toBN(Math.pow(10, decimals)));
        
        // Create the transaction
        var tx = {
            data: contract.methods.transfer(transferToAddress, transferAmountBN.toString()).encodeABI(),
            from: address,
            nonce: web3Instance.utils.toHex(txCount),
            gasPrice: web3Instance.utils.toHex(web3Instance.utils.toWei("1", 'gwei')),
            gasLimit: web3Instance.utils.toHex("400000"),
            to: tokenContractAddress,
            value: '0x0',
            chainId: '0x03'
        };

        // 3 
        return web3Instance.eth.accounts.signTransaction(tx, privateKey);
    }).then((bb) => {
        // 4
        return web3Instance.eth.sendSignedTransaction(bb.rawTransaction);
    }).then((h) => {
        // 5
        response.json({transactionHash: h.transactionHash});
        return;
    }).catch((e) => {
        response.json({error: e});
    });


    //response.json({transactionHash: txHash});
});

module.exports = router;