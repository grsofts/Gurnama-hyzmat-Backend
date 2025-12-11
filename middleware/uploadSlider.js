const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Папка куда сохраняем
const uploadDir = path.join(__dirname, '../uploads/sliders');

// Если нет — создаём
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Настраиваем storage для multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/sliders/');
  },
  filename: (req, file, cb) => {
    // Берём расширение файла
    const ext = path.extname(file.originalname);
    // Например, slider_tm_1234567890.jpg
    const lang = file.fieldname.split('_')[1]; // image_tm -> tm
    const timestamp = Date.now();
    cb(null, `slider_${lang}_${timestamp}${ext}`);
  }
});

const upload = multer({ storage });

module.exports = upload;
