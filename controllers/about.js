const models = require('../models');

const aboutController = {
 getAbout: async (req, res) => {
    try {
      const id = req.params.id;
      const lang = req.query.lang;

      const translationInclude = {
        model: models.AboutTranslation,
        as: 'translations',
        attributes: { exclude: ['createdAt', 'updatedAt', 'language_id'] },
        include: [{
          model: models.Language,
          as: 'language',
          attributes: ['code']
        }],
        required: false
      };

      const about = await models.About.findOne({
        where: id ? { id } : {},
        include: [translationInclude],
        order: [['id', 'ASC']]
      });

      if (!about) {
        return res.status(404).json({ message: 'About not found' });
      }

      const baseData = {
        id: about.id,
        small_image: about.small_image,
        large_image: about.large_image,
      };

      // 🔹 если есть id → все переводы
      if (!lang) {
        const translations = {};
        about.translations.forEach(t => {
          const code = t.language?.code || 'unknown';
          translations[code] = {
            footer_text: t.footer_text,
            short_text: t.short_text,
            full_text: t.full_text
          };
        });

        return res.json({ ...baseData, translations });
      }

      // 🔹 без id → один язык
      const t = about.translations.find(tr => tr.language?.code === lang);

      return res.json({
        ...baseData,
        footer_text: t?.footer_text || null,
        short_text: t?.short_text || null,
        full_text: t?.full_text || null
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },
 updateAbout: async (req, res) => {
    try {
      if (!req.body.data) {
        return res.status(400).json({ message: "Missing 'data' JSON field" });
      }

      const data = JSON.parse(req.body.data);

      const about = await models.About.findOne({
        include: [{ model: models.AboutTranslation, as: 'translations' }]
      });

      if (!about) {
        return res.status(404).json({ message: 'About not found' });
      }

      // === КАРТИНКИ (НЕ языковые) ===
      const smallImage = req.files?.small_image?.[0];
      const largeImage = req.files?.large_image?.[0];

      if (smallImage) {
        const newPath = path.join(__dirname, "../uploads/about", smallImage.filename);
        fs.renameSync(smallImage.path, newPath);
      }

      if (largeImage) {
        const newPath = path.join(__dirname, "../uploads/about", largeImage.filename);
        fs.renameSync(largeImage.path, newPath);
      }

      await about.update({
        small_image: smallImage ? `/about/${smallImage.filename}` : about.small_image,
        large_image: largeImage ? `/about/${largeImage.filename}` : about.large_image,
      });

      // === ПЕРЕВОДЫ ===
      for (const lang of ['ru', 'en', 'tm']) {
        const trData = data.translations?.[lang];
        if (!trData) continue;

        const langRow = await models.Language.findOne({ where: { code: lang } });
        if (!langRow) continue;

        let translation = about.translations.find(
          t => t.language_id === langRow.id
        );

        if (!translation) {
          await models.AboutTranslation.create({
            about_id: about.id,
            language_id: langRow.id,
            footer_text: trData.footer_text,
            short_text: trData.short_text,
            full_text: trData.full_text,
          });
        } else {
          await translation.update({
            footer_text: trData.footer_text,
            short_text: trData.short_text,
            full_text: trData.full_text,
          });
        }
      }

      res.json({ message: 'About updated' });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
    }
}


module.exports = aboutController;