const models = require('../models');
const fs = require('fs');
const path = require('path');
const { where } = require('sequelize');

const certificateController = {

  // ================= GET =================
  getCertificates: async (req, res) => {
    try {
      const id = req.params.id;
      const isSiteRequest = req.query.site === 'true';

      const certificates = await models.Certificate.findAll({
        where: {
          ...(id ? { id } : {}),
          ...(isSiteRequest ? { is_active: true } : {}),
        },
        order: [['createdAt', 'DESC']]
      });

      if (id) {
        if (!certificates.length) {
          return res.status(404).json({ message: 'Certificate not found' });
        }
        return res.json(certificates[0]);
      }

      res.json(certificates);

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // ================= ADD =================
  addCertificate: async (req, res) => {
    try {
      if (!req.body.data) {
        return res.status(400).json({ message: "Missing 'data' JSON field" });
      }

      const data = JSON.parse(req.body.data);

      if (!req.file) {
        return res.status(400).json({ message: 'Certificate image is required' });
      }

      const certificate = await models.Certificate.create({
        name: data.name,
        received: data.received,
        expired: data.expired || null,
        is_active: data.is_active ?? true,
        image: `/certificates/${req.file.filename}`
      });

      res.json({
        message: 'Certificate created',
        id: certificate.id
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // ================= UPDATE =================
  updateCertificate: async (req, res) => {
    try {
      const certificateId = req.params.id;

      if (!req.body.data) {
        return res.status(400).json({ message: "Missing 'data' JSON field" });
      }

      const data = JSON.parse(req.body.data);

      const certificate = await models.Certificate.findByPk(certificateId);

      if (!certificate) {
        return res.status(404).json({ message: 'Certificate not found' });
      }

      await certificate.update({
        name: data.name,
        received: data.received,
        expired: data.expired || null,
        is_active: data.is_active
      });

      // если пришёл новый файл — заменяем
      if (req.file) {
        if (certificate.image) {
          const oldPath = path.join(__dirname, '../uploads', certificate.image);
          const cleanPath = oldPath.replace('/uploads/', '');

          if (fs.existsSync(cleanPath)) {
            fs.unlinkSync(cleanPath);
          }
        }

        await certificate.update({
          image: `/certificates/${req.file.filename}`
        });
      }

      res.json({ message: 'Certificate updated' });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // ================= STATUS =================
  updateCertificateStatus: async (req, res) => {
    try {
      const certificateId = req.params.id;
      const is_active = req.query.status === 'true';

      const certificate = await models.Certificate.findByPk(certificateId);

      if (!certificate) {
        return res.status(404).json({ message: 'Certificate not found' });
      }

      await certificate.update({ is_active });

      res.json({ message: 'Certificate status updated' });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // ================= DELETE =================
  deleteCertificate: async (req, res) => {
    try {
      const certificateId = req.params.id;

      const certificate = await models.Certificate.findByPk(certificateId);

      if (!certificate) {
        return res.status(404).json({ message: 'Certificate not found' });
      }

      if (certificate.image) {
        const filePath = path.join(__dirname, '../uploads', certificate.image);
        const cleanPath = filePath.replace('/uploads/', '');

        if (fs.existsSync(cleanPath)) {
          fs.unlinkSync(cleanPath);
        }
      }

      await certificate.destroy();

      res.json({ message: 'Certificate deleted' });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
};

module.exports = certificateController;
