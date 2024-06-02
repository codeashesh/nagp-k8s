const express = require('express');
const router = express.Router();
const userService = require('../service/userService');

// Endpoint to create a new user
router.post('/', async (req, res) => {
    const { name, email } = req.body;
    console.log(`POST /api/user request received with data ${name} and ${email}`);
    try {
        const user = await userService.saveUser({ name, email });
        res.status(201).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint to fetch all stored users
router.get('/', async (req, res) => {
    console.log(`GET /api/user request received`);
    try {
        const users = await userService.getUsers();
        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint to delete all stored users
router.delete('/', async (req, res) => {
    console.log(`DELETE /api/user request received`);
    try {
        await userService.deleteUsers();
        res.status(200).json({ info: 'All Users Deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint for health checkup to be internally used by k8s
router.get('/health', async (req, res) => {
    console.log(`Health Check request received...`);
    res.status(200).json({ info: 'User Service is running' });
});

module.exports = router;