const userDb = require('../db/userDb');

async function saveUser(user) {
    return userDb.saveUser(user);
}

async function getUsers() {
    return userDb.getUsers();
}

async function deleteUsers() {
    return userDb.deleteUsers();
}

module.exports = {
    saveUser,
    getUsers,
    deleteUsers,
};