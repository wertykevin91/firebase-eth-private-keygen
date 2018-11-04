'use strict';

const express = require('express');
const firebase = require('firebase-admin');
const functions = require('firebase-functions');
const web3 = require('web3');

const router = express.Router();

router.get('/', (request, response) => {
    var web3Instance = new web3('https://ropsten.infura.io/');

    var newAcc = web3Instance.eth.accounts.create("D63726BEF9454BE2ABF94300CC38F32F");

    response.set('Cache-Control', 'public, max-age=300, s-max-age=1800');
    response.render('index/index', {privateKey : newAcc.privateKey, address : newAcc.address});
});

module.exports = router;