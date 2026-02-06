const express = require('express');
const router = express.Router();

const aboutController = require('../controllers/about');
const verify = require('../middleware/verify');
const validateUpload = require('../middleware/validateUpload');
const createUploader = require('../middleware/uploadFactory');

// uploader именно для сертификатов
const multer = createUploader({
  folder: 'about',
  prefix: 'about'
});

router.get('/about', aboutController.getAbout);
router.put('/update_about', verify,
  multer.fields([
    { name: 'small_image', maxCount: 1 },
    { name: 'large_image', maxCount: 1 }
  ]),
  validateUpload({
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 10 * 1024 * 1024 // 10MB
  }),
  aboutController.updateAbout
);


module.exports = router;