const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Partner = sequelize.define('Partner', {
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
      name: { type: DataTypes.STRING, allowNull: false },
      image: { type: DataTypes.STRING, allowNull: false }
  }, {
    tableName: 'partners'
  });

  return Partner;
};