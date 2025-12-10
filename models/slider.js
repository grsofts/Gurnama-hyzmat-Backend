const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Slider = sequelize.define('Slider', {
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  }, {
    tableName: 'sliders'
  });

  Slider.associate = (models) => {
    Slider.hasMany(models.SliderTranslation, { as: 'translations', foreignKey: 'slider_id', onDelete: 'CASCADE' });
  };

  return Slider;
};