const express = require('express');
const router = express.Router();
const sliderController = require('../controllers/sliders');
const verify = require('../middleware/verify');
const multer = require('../middleware/uploadSlider');

router.get('/sliders', verify, sliderController.getSliders);
router.get('/sliders/:id', sliderController.getSliders);
    router.post('/add_slider', 
    multer.fields([{name:'image_tm', maxCount: 1 }, {name:'image_ru', maxCount: 1 }, {name:'image_en', maxCount: 1 }]),
    sliderController.addSlider);

router.put('/update_slider/:id', 
    multer.fields([{name:'image_tm', maxCount: 1 }, {name:'image_ru', maxCount: 1 }, {name:'image_en', maxCount: 1 }]),
    sliderController.updateSlider);
router.put('/slider_status/:id', verify, sliderController.updateSliderStatus)
router.delete('/delete_slider/:id', sliderController.deleteSlider);


module.exports = router;
