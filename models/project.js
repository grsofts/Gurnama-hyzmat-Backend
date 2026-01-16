const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Project = sequelize.define('Project', {
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
      rate: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      client_name: { type: DataTypes.STRING, allowNull: true },
      address: { type: DataTypes.STRING, allowNull: true },
      completed: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      tags: { type: DataTypes.STRING, allowNull: true }
  }, {
    tableName: 'projects'
  });

  Project.associate = (models) => {
    Project.hasMany(models.ProjectTranslation, { as: 'translations', foreignKey: 'project_id' });
  };

  return Project;
};