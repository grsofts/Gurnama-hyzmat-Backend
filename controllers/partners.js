const models = require('../models');
const fs = require('fs');
const path = require('path');

const partnerController = {

  // ================= GET =================
  getPartners: async (req, res) => {
    try {
      const id = req.params.id;
      const isSiteRequest = req.query.site === 'true';

      const partners = await models.Partner.findAll({
        where: {
          ...(id ? { id } : {}),
          ...(isSiteRequest ? { is_active: true } : {}),
        },
        order: [['sort_order', 'ASC']]
      });

      if (id && !partners.length) return res.status(404).json({ message: 'Partner not found' });

      res.json(id ? partners[0] : partners);

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // ================= ADD =================
  addPartner: async (req, res) => {
    try {
      if (!req.body.data) return res.status(400).json({ message: "Missing 'data' JSON field" });
      const data = JSON.parse(req.body.data);

      if (!req.file) return res.status(400).json({ message: 'Partner image is required' });

      const partner = await models.Partner.create({
        name: data.name,
        sort_order: data.sort_order ?? 0,
        is_active: data.is_active ?? true,
        image: `/partners/${req.file.filename}`
      });

      res.json({ message: 'Partner created', id: partner.id });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // ================= UPDATE =================
  updatePartner: async (req, res) => {
    try {
      const partnerId = req.params.id;

      if (!req.body.data) return res.status(400).json({ message: "Missing 'data' JSON field" });
      const data = JSON.parse(req.body.data);

      const partner = await models.Partner.findByPk(partnerId);
      if (!partner) return res.status(404).json({ message: 'Partner not found' });

      // обновляем поля
      await partner.update({
        name: data.name,
        sort_order: data.sort_order ?? partner.sort_order,
        is_active: data.is_active ?? partner.is_active
      });

      // если пришёл новый файл — заменяем старый
      if (req.file) {
        if (partner.image) {
          const oldPath = path.join(__dirname, '../uploads', partner.image);
          const cleanPath = oldPath.replace('/uploads/', '');
          if (fs.existsSync(cleanPath)) fs.unlinkSync(cleanPath);
        }
        await partner.update({ image: `/partners/${req.file.filename}` });
      }

      res.json({ message: 'Partner updated' });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // ================= STATUS =================
  updatePartnerStatus: async (req, res) => {
    try {
      const partnerId = req.params.id;
      const is_active = req.query.status === 'true';

      const partner = await models.Partner.findByPk(partnerId);
      if (!partner) return res.status(404).json({ message: 'Partner not found' });

      await partner.update({ is_active });
      res.json({ message: 'Partner status updated' });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // ================= DELETE =================
  deletePartner: async (req, res) => {
    try {
      const partnerId = req.params.id;

      const partner = await models.Partner.findByPk(partnerId);
      if (!partner) return res.status(404).json({ message: 'Partner not found' });

      // удаляем файл изображения
      if (partner.image) {
        const filePath = path.join(__dirname, '../uploads', partner.image);
        const cleanPath = filePath.replace('/uploads/', '');
        if (fs.existsSync(cleanPath)) fs.unlinkSync(cleanPath);
      }

      await partner.destroy();
      res.json({ message: 'Partner deleted' });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
};

module.exports = partnerController;
