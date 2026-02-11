const { DataTypes } = require('sequelize');

// models/RefreshToken.js
module.exports = (sequelize) => {
  const RefreshToken = sequelize.define("RefreshToken", {
    token: { type: DataTypes.STRING, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    expires_at: { type: DataTypes.DATE, allowNull: false }
  },{
    tableName : "refresh_tokens",
  });
  
  RefreshToken.associate = (models) => {
    RefreshToken.belongsTo(models.User, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  return RefreshToken;
};
