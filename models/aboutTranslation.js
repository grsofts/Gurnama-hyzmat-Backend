const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AboutTranslation = sequelize.define('AboutTranslation', {
    language_id: { type: DataTypes.INTEGER, allowNull: false },
    footer_text: { type: DataTypes.STRING, allowNull: false },
    short_text: { type: DataTypes.STRING, allowNull: false },
    full_text: { type: DataTypes.STRING, allowNull: false },
  }, {
    tableName: 'about_translations'
  });

  AboutTranslation.associate = (models) => {
    AboutTranslation.belongsTo(models.About, { foreignKey: 'about_id' });
    AboutTranslation.belongsTo(models.Language, { foreignKey: 'language_id', as: 'language' });
  };

  return AboutTranslation;
};
