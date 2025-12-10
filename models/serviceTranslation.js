const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ServiceTranslation = sequelize.define('ServiceTranslation', {
    language_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    short_desc: { type: DataTypes.TEXT, allowNull: true },
    full_desc: { type: DataTypes.TEXT, allowNull: true },
    image: { type: DataTypes.STRING, allowNull: true },
  }, {
    tableName: 'services_translations'
  });

  ServiceTranslation.associate = (models) => {
    ServiceTranslation.belongsTo(models.Service, { foreignKey: 'service_id' });
    ServiceTranslation.belongsTo(models.Language, { foreignKey: 'language_id', as: 'language' });
  };

  return ServiceTranslation;
};
