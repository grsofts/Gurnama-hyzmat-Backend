const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Language = sequelize.define('Language', {
    code: { type: DataTypes.STRING(5), allowNull: false, unique: true }, // 'ru','tm','en'
    name: { type: DataTypes.STRING(50), allowNull: false },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    tableName: 'languages'
  });

  return Language;
};
