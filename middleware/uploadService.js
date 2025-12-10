const multer = require('multer');
const path = require('path');

// Настраиваем storage для multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/services/');
  },
  filename: (req, file, cb) => {
    // Берём расширение файла
    const ext = path.extname(file.originalname);
    // Например, service_tm_1234567890.jpg
    const lang = file.fieldname.split('_')[1]; // image_tm -> tm
    const timestamp = Date.now();
    cb(null, `service_${lang}_${timestamp}${ext}`);
  }
});

const upload = multer({ storage });

module.exports = upload;
