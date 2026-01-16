const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const verify = require('../middleware/verify');
const validateUpload = require('../middleware/validateUpload');
const createUploader = require('../middleware/uploadFactory');

// uploader для проектов
const multer = createUploader({ folder: 'projects', prefix: 'project' });

// ================= GET =================
router.get('/projects', verify, projectController.getProjects);
router.get('/projects/:id', verify, projectController.getProjects);

// ================= ADD =================
router.post(
  '/add_project',
  verify,
  multer.array('images'),
  validateUpload({
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 10 * 1024 * 1024
  }),
  projectController.addProject
);

// ================= UPDATE =================
router.put(
  '/update_project/:id',
  verify,
  multer.array('images'),
  validateUpload({
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 10 * 1024 * 1024
  }),
  projectController.updateProject
);

// ================= STATUS =================
router.put(
  '/project_status/:id',
  verify,
  projectController.updateProjectStatus
);

// ================= DELETE =================
router.delete(
  '/delete_project/:id',
  verify,
  projectController.deleteProject
);

module.exports = router;
