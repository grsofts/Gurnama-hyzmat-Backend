const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Service = sequelize.define('Service', {
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    tableName: 'services'
  });

  Service.associate = (models) => {
    Service.hasMany(models.ServiceTranslation, { as: 'translations', foreignKey: 'service_id', onDelete: 'CASCADE' });
  };

  return Service;
};
