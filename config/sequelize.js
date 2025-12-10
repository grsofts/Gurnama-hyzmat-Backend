const { Sequelize } = require('sequelize');
require('dotenv').config();


const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT || 'mysql',
  logging: false, // true если хочешь SQL в консоли
  define: {
    underscored: true, // snake_case колонки в БД
    timestamps: true
  }
});

module.exports = sequelize;