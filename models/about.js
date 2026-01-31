const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const About = sequelize.define('About', {
      
      small_image: { type: DataTypes.STRING, allowNull: false },
      large_image: { type: DataTypes.STRING, allowNull: false }
  }, {
    tableName: 'about'
  });
  About.associate = (models) => {
    About.hasMany(models.AboutTranslation, { as: 'translations', foreignKey: 'about_id', onDelete: 'CASCADE' });
  };

  return About;
};