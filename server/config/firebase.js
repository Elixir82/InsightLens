let admin = require('firebase-admin');
let serviceAccount = require('../../authforobara-firebase-adminsdk-fbsvc-e652d5b37b.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)});

module.exports = admin;
