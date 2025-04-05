// config/db.js
require('dotenv').config();
const { Sequelize } = require('sequelize');

// Setup Sequelize instance
const sequelize = new Sequelize('lms_db', 'postgres', 'Vasu17', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false, // Set true if you want to see SQL logs
});

module.exports = sequelize;
