const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProjectImages = sequelize.define('ProjectImages', {
    project_id: { type: DataTypes.INTEGER, allowNull: false },
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
    image_url: { type: DataTypes.STRING, allowNull: false },
    alt_text: { type: DataTypes.STRING, allowNull: true }
  }, {
    tableName: 'projects_images'
  });

  ProjectImages.associate = (models) => {
    ProjectImages.belongsTo(models.Project, { foreignKey: 'project_id' });
  };

  return ProjectImages;
};
