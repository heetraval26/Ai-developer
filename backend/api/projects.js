// backend/api/projects.js
import { body } from 'express-validator';
import * as projectController from '../controllers/project.controller.js';
import * as authMiddleWare from '../middleware/auth.middleware.js';

module.exports = (req, res) => {
  // Handle POST /create
  if (req.method === 'POST' && req.url === '/api/create') {
    authMiddleWare.authUser(req, res, () => {
      body('name').isString().withMessage('Name is required');
      projectController.createProject(req, res);
    });
  }
  // Handle GET /all
  else if (req.method === 'GET' && req.url === '/api/all') {
    authMiddleWare.authUser(req, res, () => {
      projectController.getAllProject(req, res);
    });
  }
  // Handle PUT /add-user
  else if (req.method === 'PUT' && req.url === '/api/add-user') {
    authMiddleWare.authUser(req, res, () => {
      body('projectId').isString().withMessage('Project ID is required');
      body('users').isArray({ min: 1 }).withMessage('Users must be an array of strings').bail()
        .custom((users) => users.every(user => typeof user === 'string')).withMessage('Each user must be a string');
      projectController.addUserToProject(req, res);
    });
  }
  // Handle GET /get-project/:projectId
  else if (req.method === 'GET' && req.url.startsWith('/api/get-project/')) {
    authMiddleWare.authUser(req, res, () => {
      const projectId = req.url.split('/')[3]; // Extract projectId from the URL
      projectController.getProjectById(req, res, projectId);
    });
  }
  // Handle PUT /update-file-tree
  else if (req.method === 'PUT' && req.url === '/api/update-file-tree') {
    authMiddleWare.authUser(req, res, () => {
      body('projectId').isString().withMessage('Project ID is required');
      body('fileTree').isObject().withMessage('File tree is required');
      projectController.updateFileTree(req, res);
    });
  }
  else {
    res.status(404).send({ message: 'Not Found' });
  }
};
