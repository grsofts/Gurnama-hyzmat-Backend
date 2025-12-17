
const models = require('../models');
const fs = require('fs');
const path = require('path');

const sliderController = {
  getSliders: async (req, res) => {
    try {
        // ?lang=ru или default 'ru'
        const lang = req.query.lang || 'ru';
        const language = await models.Language.findOne({ where: { code: lang }});
        const languageId = language ? language.id : 1;
        const id = req.params.id;

        const sliders = await models.Slider.findAll({
          order: [['sort_order', 'ASC']],
          where: id ? { id: id } : {},
          include: [{
              model: models.SliderTranslation,
              as: 'translations',
              where: { language_id: languageId },
              required: false
          }]
        });

        // map: вернуть удобный объект с translation
        const result = sliders.map(s => {
          const t = s.translations && s.translations[0];
          
          return {
              id: s.id,
              sort_order: s.sort_order,
              name: t ? t.name : null,
              title: t ? t.title : null,
              desc: t ? t.desc : null,
              image: t.image,
              link: s.link,
              is_custom_link: s.isCustomLink,
              is_active: s.is_active,
              createdAt: s.createdAt,
              updatedAt: s.updatedAt
          };
        });

        res.status(result.length > 0 ? 200 : 404).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
  },
  addSlider: async (req, res) => {
    try {
      //checking all images requirement
      if (!req.files || !req.files.image_tm || !req.files.image_ru || !req.files.image_en) {
        //remove if exists 2 files is uploaded
        if (req.files) {
          Object.keys(req.files).forEach(key => {
            req.files[key].forEach(file => {
              fs.unlinkSync(file.path);
            });
          });
        }
        return res.status(400).json({ message: "All images (tm, ru, en) are required." });
      }

      // 1. Парсим JSON
      if (!req.body.data) {
        if (req.files) {
          Object.keys(req.files).forEach(key => {
            req.files[key].forEach(file => {
              fs.unlinkSync(file.path);
            });
          });
        }
        return res.status(400).json({ message: "Missing 'data' JSON field" });
      }

      const data = JSON.parse(req.body.data);

      // 2. Создаем Slider
      const slider = await models.Slider.create({
        sort_order: data.sort_order,
        is_active: data.is_active,
        link: data.link,
        is_custom_link: data.is_custom_link
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
          const newPath = path.join(__dirname, "../uploads/sliders", file.filename);
          fs.renameSync(file.path, newPath);

          savedImages.push(`/uploads/sliders/${file.filename}`);
        }

        await models.SliderTranslation.create({
          slider_id: slider.id,
          language_id: langRow.id,
          name: tr.name,
          title: tr.title,
          desc: tr.desc,
          image: files[`image_${lang}`]?.[0]?.filename ? '/sliders/' + files[`image_${lang}`]?.[0]?.filename : null
        });
      }

      return res.json({ message: "Slider created", id: slider.id });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  },
  updateSlider: async (req, res) => {
    try {
      const sliderId = req.params.id;

      // 1. Проверяем, что есть JSON с данными
      if (!req.body.data) {
        return res.status(400).json({ message: "Missing 'data' JSON field" });
      }

      const data = JSON.parse(req.body.data);

      // 2. Находим существующую услугу
      const slider = await models.Slider.findByPk(sliderId, {
        include: [{ model: models.SliderTranslation, as: 'translations' }]
      });

      if (!slider) return res.status(404).json({ message: 'Slider not found' });

      // 3. Обновляем основные поля
      await slider.update({
        sort_order: data.sort_order,
        link: data.link,
        is_custom_link: data.is_custom_link,
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
        let translation = slider.translations.find(t => t.language_id === langRow.id);
        if (!translation) {
          translation = await models.SliderTranslation.create({
            slider_id: slider.id,
            language_id: langRow.id,
            name: tr.name,
            title: tr.title,
            desc: tr.desc,
            image: null
          });
        } else {
          await translation.update({
            name: tr.name,
            title: tr.title,
            desc: tr.desc,
            });
        }

        // Если есть новый файл — сохраняем
        if (mapLang[lang].length > 0) {
          const file = mapLang[lang][0];
          const newPath = path.join(__dirname, "../uploads/sliders", file.filename);
          fs.renameSync(file.path, newPath);
          await translation.update({ image: `/sliders/${file.filename}` });
        }
      }

      res.json({ message: 'Slider updated' });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },
  deleteSlider: async (req, res) => {
    try {
      const sliderId = req.params.id;

      // 2. Находим существующий слайдер
      const slider = await models.Slider.findByPk(sliderId, {
        include: [{ model: models.SliderTranslation, as: 'translations' }]
      });

      if (!slider) return res.status(404).json({ message: 'Slider not found' });

      // 2. Удаляем изображения переводов
      for (const tr of slider.translations) {
        if (tr.image) {
          const filePath = path.join(__dirname, "../uploads/", tr.image);

          // убираем ведущий "/" если есть
          const cleanPath = filePath.replace("/uploads/", "");

          if (fs.existsSync(cleanPath)) {
            fs.unlinkSync(cleanPath); // удаляем картинку
          }
        }
      }

      // 3. Удаляем сам слайдер (все переводы удалятся из-за CASCADE)
      await slider.destroy();

      res.json({ message: 'Slider deleted' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
};
module.exports = sliderController;