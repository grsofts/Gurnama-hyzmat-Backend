const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const About = sequelize.define('About', {
      footer_text: { type: DataTypes.STRING, allowNull: false },
      short_text: { type: DataTypes.STRING, allowNull: false },
      full_text: { type: DataTypes.STRING, allowNull: false },
      small_image: { type: DataTypes.STRING, allowNull: false },
      large_image: { type: DataTypes.STRING, allowNull: false }
  }, {
    tableName: 'about'
  });

  return About;
};