require("dotenv").config();
console.log("Connecting to host:", process.env.PGHOST);

const { Client } = require('pg');
const client = new Client({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  port: process.env.PGPORT,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: {
    rejectUnauthorized: false
  }
});


client.connect()
  .then(() => {
    console.log("Connected to Neon Database successfully from db.js!");
  })
  
  .catch(err => {
    console.error("Neon Database connection error in db.js:", err.message);
    console.error("Error details:", err);
    process.exit(1);
  });


module.exports = client;