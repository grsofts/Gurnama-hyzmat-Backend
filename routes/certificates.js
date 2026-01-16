const express = require('express');
const router = express.Router();

const certificateController = require('../controllers/certificates');
const verify = require('../middleware/verify');
const validateUpload = require('../middleware/validateUpload');
const createUploader = require('../middleware/uploadFactory');

// uploader именно для сертификатов
const multer = createUploader({
  folder: 'certificates',
  prefix: 'certificate'
});

// ================= GET =================
router.get('/certificates', verify, certificateController.getCertificates);
router.get('/certificates/:id', verify, certificateController.getCertificates);

// ================= ADD =================
router.post(
  '/add_certificate',
  verify,
  multer.single('image'),
  validateUpload({
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    maxSize: 20 * 1024 * 1024 // 20MB
  }),
  certificateController.addCertificate
);

// ================= UPDATE =================
router.put(
  '/update_certificate/:id',
  verify,
  multer.single('image'),
  validateUpload({
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    maxSize: 20 * 1024 * 1024
  }),
  certificateController.updateCertificate
);

// ================= STATUS =================
router.put(
  '/certificate_status/:id',
  verify,
  certificateController.updateCertificateStatus
);

// ================= DELETE =================
router.delete(
  '/delete_certificate/:id',
  verify,
  certificateController.deleteCertificate
);

module.exports = router;
