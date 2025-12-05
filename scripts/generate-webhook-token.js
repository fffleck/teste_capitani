const crypto = require('crypto');
const token = crypto.randomBytes(16).toString('hex');
console.log("NEW_WEBHOOK_TOKEN:", token);
