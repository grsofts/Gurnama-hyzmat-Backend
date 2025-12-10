const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SliderTranslation = sequelize.define('SliderTranslation', {
    language_id: { type: DataTypes.INTEGER, allowNull: false },
    name : { type: DataTypes.STRING(150), allowNull:false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    desc: { type: DataTypes.TEXT, allowNull: true },
    image: { type: DataTypes.STRING, allowNull: true },
    link: { type: DataTypes.STRING, allowNull: true },
    isCustomLink: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: 'sliders_translations'
  });

  SliderTranslation.associate = (models) => {
    SliderTranslation.belongsTo(models.Slider, { foreignKey: 'slider_id' });
    SliderTranslation.belongsTo(models.Language, { foreignKey: 'language_id', as: 'language' });
  };

  return SliderTranslation;
};
