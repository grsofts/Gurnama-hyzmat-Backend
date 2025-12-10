const fs = require('fs');
const path = require('path');
const sequelize = require('../config/sequelize');

const models = {};
const defineModel = (file) => {
  const m = require(path.join(__dirname, file))(sequelize);
  models[m.name] = m;
};

// перечисли модели вручную или автоматизируй:
defineModel('language.js');
defineModel('service.js');
defineModel('serviceTranslation.js');
defineModel('user.js');
defineModel('refreshToken.js');
defineModel('slider.js');
defineModel('sliderTranslation.js');

// Прокинь ассоциации (если определены)
Object.keys(models).forEach(name => {
  if (typeof models[name].associate === 'function') {
    models[name].associate(models);
  }
});

// Прописываем ассоциации **только здесь**, после загрузки всех моделей
if (models.RefreshToken && models.User) {
  models.RefreshToken.belongsTo(models.User, { foreignKey: 'user_id' });
  models.User.hasMany(models.RefreshToken, { foreignKey: 'user_id' });
}

models.sequelize = sequelize;
models.Sequelize = require('sequelize');

module.exports = models;
