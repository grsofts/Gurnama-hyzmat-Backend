const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partners');
const verify = require('../middleware/verify');
const validateUpload = require('../middleware/validateUpload');
const createUploader = require('../middleware/uploadFactory');

// uploader для партнёров
const multer = createUploader({ folder: 'partners', prefix: 'partner' });

// ================= GET =================
router.get('/partners', verify, partnerController.getPartners);
router.get('/partners/:id', verify, partnerController.getPartners);

// ================= ADD =================
router.post(
  '/add_partner',
  verify,
  multer.single('image'),
  validateUpload({
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 5 * 1024 * 1024 // 5MB
  }),
  partnerController.addPartner
);

// ================= UPDATE =================
router.put(
  '/update_partner/:id',
  verify,
  multer.single('image'),
  validateUpload({
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 5 * 1024 * 1024
  }),
  partnerController.updatePartner
);

// ================= STATUS =================
router.put(
  '/partner_status/:id',
  verify,
  partnerController.updatePartnerStatus
);

// ================= DELETE =================
router.delete(
  '/delete_partner/:id',
  verify,
  partnerController.deletePartner
);

module.exports = router;
