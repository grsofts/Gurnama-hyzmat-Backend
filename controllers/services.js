
const models = require('../models');
const fs = require('fs');
const path = require('path');

const serviceController = {
 getServices: async (req, res) => {
  try {
    const id = req.params.id;
    const lang = req.query.lang || 'ru';

    let translationInclude = {
      model: models.ServiceTranslation,
      as: 'translations',
      required: false,
      attributes: { exclude: ['createdAt', 'updatedAt', 'language_id'] }
    };

    if (id) {
      // Для одного сервиса — нужны коды языков
      translationInclude.include = [{
        model: models.Language,
        as: 'language',
        attributes: ['code']
      }];
    } else {
      // Для списка — только один язык
      const language = await models.Language.findOne({ where: { code: lang } });
      translationInclude.where = { language_id: language ? language.id : 1 };
    }

    const services = await models.Service.findAll({
      order: [['sort_order', 'ASC']],
      where: id ? { id } : {},
      include: [translationInclude]
    });

    const result = services.map(s => {
      const baseData = {
        id: s.id,
        sort_order: s.sort_order,
        is_active: s.is_active,
        image: s.image,
        createdAt: s.createdAt
      };

      // ====== ONE SERVICE (EDIT MODE) ======
      if (id) {
        const translations = {};

        s.translations.forEach(t => {
          const code = t.language?.code || 'unknown';
          translations[code] = {
            title: t.title,
            short_desc: t.short_desc,
            full_desc: t.full_desc,
            image: t.image
          };
        });

        return {
          ...baseData,
          translations
        };
      }

      // ====== LIST MODE ======
      const t = s.translations?.[0];

      return {
        ...baseData,
        title: t?.title || null,
        short_desc: t?.short_desc || null
      };
    });

    res.status(result.length ? 200 : 404).json(id ? result[0] : result);

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