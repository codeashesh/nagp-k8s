const userDb = require('../db/userDb');

async function initializeDb() {
    return userDb.initializeDb();
}

module.exports = {
    initializeDb,
};