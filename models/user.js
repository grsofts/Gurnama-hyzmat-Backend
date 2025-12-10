const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    login: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: true },
    password: { type: DataTypes.STRING, allowNull:false },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true, allowNull:false }
  }, {
    tableName: 'users'
  });

  return User;
};