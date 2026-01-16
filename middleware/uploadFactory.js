const multer = require('multer');
const path = require('path');
const fs = require('fs');

function createUploader({ folder, prefix }) {
  const uploadDir = path.join(__dirname, `../uploads/${folder}`);

  // создаём папку если нет
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const lang = file.fieldname.split('_')[1] || 'default';
      const timestamp = Date.now();
      cb(null, `${prefix}_${lang}_${timestamp}${ext}`);
    }
  });

  return multer({ storage });
}

module.exports = createUploader;
