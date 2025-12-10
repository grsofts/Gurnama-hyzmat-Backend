const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/services');
const verify = require('../middleware/verify');
const multer = require('../middleware/uploadService');

router.get('/services', verify, serviceController.getServices);
router.get('/services/:id', serviceController.getServices);
router.post('/add_service', 
    multer.fields([{name:'image_tm', maxCount: 1 }, {name:'image_ru', maxCount: 1 }, {name:'image_en', maxCount: 1 }]), 
    serviceController.addService);
router.put('/update_service/:id', 
    multer.fields([{name:'image_tm', maxCount: 1 }, {name:'image_ru', maxCount: 1 }, {name:'image_en', maxCount: 1 }]),
    serviceController.updateService);
router.delete('/delete_service/:id', serviceController.deleteService);

module.exports = router;
