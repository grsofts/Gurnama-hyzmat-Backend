const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Certificate = sequelize.define('Certificate', {
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      name: { type: DataTypes.STRING, allowNull: false },
      image: { type: DataTypes.STRING, allowNull: false },
      received: { type: DataTypes.DATE, allowNull: false },
      expired: { type: DataTypes.DATE, allowNull: true }
  }, {
    tableName: 'certificates'
  });

  return Certificate;
};