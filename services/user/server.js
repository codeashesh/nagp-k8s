const express = require('express');
const bodyParser = require('body-parser');
const userController = require('./controller/userController');
const loadController = require('./controller/loadController');
const { initializeDb } = require('./service/initializeDbService');

const app = express();
const port = process.env.USER_PORT || 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Endpoint default to show all supported features
app.get('/', (req, res) => {
  console.log(`Default request received...`);
  res.send(`Welcome to Ashesh Saraf Kubernetes & Docker NAGP Server.<br> 
  Exposing the following endpoints: <br>
  1. POST /api/user (Create new user)<br>
  2. GET /api/user (Get all users)<br>
  3. DELETE /api/user (Delete all users)<br>
  4. GET api/load/user/start (Start Generating load in user service)<br>
  5. GET api/load/user/decrease (Decrease load in user service)<br>
  6. GET api/load/user/stop (Stop the load in user service)` 
  );
})

app.use('/api/user', userController);
app.use('/api/load/user', loadController);

async function startServer() {
  await initializeDb();
  app.listen(port, () => {
    console.log(`User service is running on port ${port}`);
  });
}

startServer();