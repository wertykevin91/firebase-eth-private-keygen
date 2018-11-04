const functions = require('firebase-functions');
const express = require('express');
const engines = require('consolidate');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const app = express();
app.engine('hbs', engines.handlebars);
app.set('views', './views');
app.set('view engine', 'hbs');
app.set('view options', { layout: 'layout' });

var home = require('./routes/index');
app.use('/', home);

exports.app = functions.https.onRequest(app);
