// backend/api/users.js
import { body } from 'express-validator';
import { createUserController, getAllUsersController, loginController, logoutController, profileController } from "../controllers/user.controller.js";
import { authUser } from "../middleware/auth.middleware.js";

module.exports = (req, res) => {
  // Handle POST /register
  if (req.method === 'POST' && req.url === '/api/register') {
    body("email").isEmail().withMessage("Email must be a valid email address");
    body("password").isLength({ min: 3 }).withMessage("Password must be at least 3 characters long");
    createUserController(req, res);
  }
  // Handle POST /login
  else if (req.method === 'POST' && req.url === '/api/login') {
    body("email").isEmail().withMessage("Email must be a valid email address");
    body("password").isLength({ min: 3 }).withMessage("Password must be at least 3 characters long");
    loginController(req, res);
  }
  // Handle GET /profile
  else if (req.method === 'GET' && req.url === '/api/profile') {
    authUser(req, res, () => {
      profileController(req, res);
    });
  }
  // Handle GET /logout
  else if (req.method === 'GET' && req.url === '/api/logout') {
    authUser(req, res, logoutController);
  }
  // Handle GET /all
  else if (req.method === 'GET' && req.url === '/api/all') {
    authUser(req, res, getAllUsersController);
  }
  else {
    res.status(404).send({ message: 'Not Found' });
  }
};
