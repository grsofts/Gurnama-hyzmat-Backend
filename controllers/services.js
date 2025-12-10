
const models = require('../models');
const fs = require('fs');
const path = require('path');

const serviceController = {
  getServices: async (req, res) => {
    try {
        // ?lang=ru или default 'ru'
        const lang = req.query.lang || 'ru';
        const language = await models.Language.findOne({ where: { code: lang }});
        const languageId = language ? language.id : 1;
        const id = req.params.id;

        const services = await models.Service.findAll({
          order: [['sort_order', 'ASC']],
          where: id ? { id: id } : {},
          include: [{
              model: models.ServiceTranslation,
              as: 'translations',
              where: { language_id: languageId },
              required: false
          }]
        });

        // map: вернуть удобный объект с translation
        const result = services.map(s => {
          const t = s.translations && s.translations[0];
          
          return id ? {
              id: s.id,
              sort_order: s.sort_order,
              title: t ? t.title : null,
              short_desc: t ? t.short_desc : null,
              full_desc: id ? t.full_desc : null,
              image: t.image,
          } : {
              id: s.id,
              sort_order: s.sort_order,
              title: t ? t.title : null,
              short_desc: t ? t.short_desc : null,
              image: t.image,
          };
        });

        res.status(result.length > 0 ? 200 : 404).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
  },
  addService: async (req, res) => {
    try {
      // 1. Парсим JSON
      if (!req.body.data) {
        return res.status(400).json({ message: "Missing 'data' JSON field" });
      }

      const data = JSON.parse(req.body.data);

      // 2. Создаем Service
      const service = await models.Service.create({
        sort_order: data.sort_order,
        is_active: data.is_active
      });

      // 3. Файлы по языкам
      const files = req.files;

      const mapLang = {
        ru: files?.images_ru || [],
        en: files?.images_en || [],
        tm: files?.images_tm || []
      };

      // 4. Сохраняем переводы
      for (let lang of ["ru", "en", "tm"]) {
        const langRow = await models.Language.findOne({ where: { code: lang } });

        const tr = data.translations[lang];

        const savedImages = [];

        for (const file of mapLang[lang]) {
          const newPath = path.join(__dirname, "../uploads/services", file.filename);
          fs.renameSync(file.path, newPath);

          savedImages.push(`/uploads/services/${file.filename}`);
        }

        await models.ServiceTranslation.create({
          service_id: service.id,
          language_id: langRow.id,
          title: tr.title,
          short_desc: tr.short_desc,
          full_desc: tr.full_desc,
          image: files[`image_${lang}`]?.[0]?.filename ? '/services/' + files[`image_${lang}`]?.[0]?.filename : null
        });
      }

      return res.json({ message: "Service created", id: service.id });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  },
  updateService: async (req, res) => {
    try {
      const serviceId = req.params.id;

      // 1. Проверяем, что есть JSON с данными
      if (!req.body.data) {
        return res.status(400).json({ message: "Missing 'data' JSON field" });
      }

      const data = JSON.parse(req.body.data);

      // 2. Находим существующую услугу
      const service = await models.Service.findByPk(serviceId, {
        include: [{ model: models.ServiceTranslation, as: 'translations' }]
      });

      if (!service) return res.status(404).json({ message: 'Service not found' });

      // 3. Обновляем основные поля
      await service.update({
        sort_order: data.sort_order,
        is_active: data.is_active
      });

      // 4. Обновляем переводы
      const files = req.files || {};
      const mapLang = {
        ru: files?.image_ru || [],
        en: files?.image_en || [],
        tm: files?.image_tm || []
      };

      for (let lang of ["ru", "en", "tm"]) {
        const langRow = await models.Language.findOne({ where: { code: lang } });
        const tr = data.translations[lang];
        if (!tr) continue;

        // Находим существующий перевод
        let translation = service.translations.find(t => t.language_id === langRow.id);
        if (!translation) {
          translation = await models.ServiceTranslation.create({
            service_id: service.id,
            language_id: langRow.id,
            title: tr.title,
            short_desc: tr.short_desc,
            full_desc: tr.full_desc,
            image: null
          });
        } else {
          await translation.update({
            title: tr.title,
            short_desc: tr.short_desc,
            full_desc: tr.full_desc
          });
        }

        // Если есть новый файл — сохраняем
        if (mapLang[lang].length > 0) {
          const file = mapLang[lang][0];
          const newPath = path.join(__dirname, "../uploads/services", file.filename);
          fs.renameSync(file.path, newPath);
          await translation.update({ image: `/services/${file.filename}` });
        }
      }

      res.json({ message: 'Service updated' });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },
  deleteService: async (req, res) => {
    try {
      const serviceId = req.params.id;

      // 2. Находим существующую услугу
      const service = await models.Service.findByPk(serviceId, {
        include: [{ model: models.ServiceTranslation, as: 'translations' }]
      });

      if (!service) return res.status(404).json({ message: 'Service not found' });

      // 2. Удаляем изображения переводов
      for (const tr of service.translations) {
        if (tr.image) {
          const filePath = path.join(__dirname, "../uploads/", tr.image);

          // убираем ведущий "/" если есть
          const cleanPath = filePath.replace("/uploads/", "");

          if (fs.existsSync(cleanPath)) {
            fs.unlinkSync(cleanPath); // удаляем картинку
          }
        }
      }

      // 3. Удаляем саму услугу (все переводы удалятся из-за CASCADE)
      await service.destroy();

      res.json({ message: 'Service deleted' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
};
module.exports = serviceController;