const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/services');
const verify = require('../middleware/verify');
const validateUpload = require('../middleware/validateUpload');
const createUploader = require('../middleware/uploadFactory');
const multer = createUploader({ folder: 'services', prefix: 'service' });

router.get('/services', serviceController.getServices);
router.get('/services/:id', serviceController.getServices);
router.post('/add_service', 
    verify,
    multer.fields([{name:'image_tm', maxCount: 1 }, {name:'image_ru', maxCount: 1 }, {name:'image_en', maxCount: 1 }]), 
    validateUpload({ allowedTypes: ['image/jpeg', 'image/png'], maxSize: 10 * 1024 * 1024 }),
    serviceController.addService);
router.put('/update_service/:id', 
    verify,
    multer.fields([{name:'image_tm', maxCount: 1 }, {name:'image_ru', maxCount: 1 }, {name:'image_en', maxCount: 1 }]),
    validateUpload({ allowedTypes: ['image/jpeg', 'image/png'], maxSize: 10 * 1024 * 1024 }),
    serviceController.updateService);
router.put('/service_status/:id', verify, serviceController.updateServiceStatus);
router.delete('/delete_service/:id', verify, serviceController.deleteService);

module.exports = router;
