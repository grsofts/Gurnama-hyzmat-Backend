const models = require('../models');
const sequelize = require('../config/sequelize');

async function init() {
  await sequelize.authenticate();
  // ВНИМАНИЕ: force:true удалит данные. Для первого запуска — ок.
  await sequelize.sync({ alter: true }); // alter безопаснее чем force в dev
  console.log('DB synced');

  console.log('Seed done');
  process.exit(0);
}

init().catch(err => { console.error(err); process.exit(1); });
