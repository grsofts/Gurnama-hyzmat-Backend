const express = require('express');
const router = express.Router();

const contactController = require('../controllers/contact');
const verify = require('../middleware/verify');
const validateUpload = require('../middleware/validateUpload');
const createUploader = require('../middleware/uploadFactory');

const multer = createUploader({
  folder: 'contacts',
  prefix: 'contact'
});

router.get('/contacts', contactController.getContacts);
router.post('/add_contact', verify, multer.single('icon'), contactController.addContact);
router.put('/update_contact', verify, multer.single('icon'), contactController.updateContact);
router.delete('/delete_contact/:id', verify, contactController.deleteContact);

module.exports = router;