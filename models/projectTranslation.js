const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProjectTranslation = sequelize.define('ProjectTranslation', {
    language_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    short_desc: { type: DataTypes.TEXT, allowNull: true },
    full_desc: { type: DataTypes.TEXT, allowNull: true }
  }, {
    tableName: 'projects_translations'
  });

  ProjectTranslation.associate = (models) => {
    ProjectTranslation.belongsTo(models.Project, { foreignKey: 'project_id' });
    ProjectTranslation.belongsTo(models.Language, { foreignKey: 'language_id', as: 'language' });
  };

  return ProjectTranslation;
};
