const models = require('../models');

const aboutController = {
  getAbout: async (req, res) => {
    try {
      const about = await models.About.findAll();
      res.json(about);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },
  addAbout: async (req, res) => {
    try {
      if (!req.body.data) {
        return res.status(400).json({ message: "Missing 'data' JSON field" });
      }

      const data = JSON.parse(req.body.data);

      if (!req.files?.small_image || !req.files?.large_image) {
        return res.status(400).json({ message: 'Both images are required' });
        }

      const smallImage = req.files.small_image[0];
      const largeImage = req.files.large_image[0];

      const about = await models.About.create({ 
        footer_text: data.footer_text, 
        short_text: data.short_text,
        full_text: data.full_text,
        small_image: `/about/${smallImage.filename}`,
        large_image: `/about/${largeImage.filename}`,
     });
      res.status(201).json({ message: 'About created', id: about.id });
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

        const about = await models.About.findOne();
        if (!about) {
        return res.status(404).json({ message: 'About not found' });
        }

        // Если пришли файлы — берём, если нет — оставляем старые
        const smallImage = req.files?.small_image?.[0];
        const largeImage = req.files?.large_image?.[0];

        await about.update({
        footer_text: data.footer_text ?? about.footer_text,
        short_text: data.short_text ?? about.short_text,
        full_text: data.full_text ?? about.full_text,
        small_image: smallImage
            ? `/about/${smallImage.filename}`
            : about.small_image,
        large_image: largeImage
            ? `/about/${largeImage.filename}`
            : about.large_image,
        });
        res.json({ message: 'About updated', id: about.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
  },

  deleteAbout: async (req, res) => {
    try {
      const aboutId = req.params.id;
      const about = await models.About.findByPk(aboutId);
      if (!about) return res.status(404).json({ message: 'About not found' });
      await about.destroy();
      res.json({ message: 'About deleted' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
}


module.exports = aboutController;