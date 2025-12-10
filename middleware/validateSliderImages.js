const validateImages = (req, res, next) => {
    if (
        !req.files?.image_tm ||
        !req.files?.image_ru ||
        !req.files?.image_en ||
        req.files.image_tm.length === 0 ||
        req.files.image_ru.length === 0 ||
        req.files.image_en.length === 0
    ) {
        return res.status(400).json({
            message: "Images for all languages (tm, ru, en) are required."
        });
    }

    next();
};

module.exports = validateImages;