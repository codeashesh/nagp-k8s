const express = require('express');
const router = express.Router();
const loadService = require('../service/loadService');

// Endpoint to start load generation
router.get('/start', (req, res) => {
    console.log(`GET /api/user/load/start request received`);
    try {
        // Duration in milliseconds and Load increase step
        const { duration = 30000, step = 500 } = req.query;
        // Increase load
        loadService.startLoad(duration, step);
        res.status(200).json({ info: 'Load generation started' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error generating load in user service' });
    }
});

// Endpoint to stop load generation
router.get('/stop', (req, res) => {
    console.log(`GET /api/user/load/stop request received`);
    try {
        loadService.stopLoad();
        res.status(200).json({ info: 'Load generation stopped' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error stopping load in user service' });
    }
});

// Endpoint to decrease load generation
router.get('/decrease', (req, res) => {
    console.log(`GET /api/user/load/decrease request received`);
    try {
        const { step = 500 } = req.query;
        loadService.decreaseLoad(step);
        res.status(200).json({ info: 'Load decreasing started' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error decreasing load in user service' });
    }
});

module.exports = router;