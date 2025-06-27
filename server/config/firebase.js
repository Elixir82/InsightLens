const admin = require("firebase-admin");
const serviceAccount = require("/etc/secrets/firebase-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
