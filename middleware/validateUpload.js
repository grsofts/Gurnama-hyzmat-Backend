function validateUpload({ allowedTypes, maxSize }) {
  return (req, res, next) => {
    const files = req.files || {};
    const allFiles = Object.values(files).flat();

    for (const file of allFiles) {
      if (allowedTypes && !allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          message: `Недопустимый тип файла: ${file.mimetype}`
        });
      }

      if (maxSize && file.size > maxSize) {
        return res.status(400).json({
          message: `Файл слишком большой. Максимум ${maxSize / 1024 / 1024}MB`
        });
      }
    }

    next();
  };
}

module.exports = validateUpload;
