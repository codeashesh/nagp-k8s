const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Function to create the table if it doesn't exist
async function createTable() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100)
      )
    `);
  }

// Function to initialize the database
async function initializeDb() {
    try {
        await createTable();
        console.log('Users table created or already exists');
    } catch(err) {
        console.error(err);
    }
}

async function saveUser({ name, email }) {
    const result = await pool.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *', [name, email]);
    return result.rows[0];
}

async function getUsers() {
    const result = await pool.query('SELECT * FROM users');
    return result.rows;
}

async function deleteUsers() {
    const result = await pool.query('DELETE FROM users');
    return result.rows;
}

module.exports = {
    initializeDb,
    saveUser,
    getUsers,
    deleteUsers,
};
