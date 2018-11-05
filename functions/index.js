const functions = require('firebase-functions');
const express = require('express');
//const engines = require('consolidate');
const bodyParser = require('body-parser');
const exhbs = require('express-handlebars');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const app = express();

app.use(bodyParser.json());       // to support JSON-encoded bodies
// app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
//   extended: true
// }));

app.set('views', './views');
app.set('view engine', 'hbs');
app.set('view options');
app.engine('hbs', exhbs({
    extname: "hbs",
    layoutsDir: "views/layouts",
    defaultLayout: "layout"
}));

var home = require('./routes/index');
app.use('/', home);

exports.app = functions.https.onRequest(app);
