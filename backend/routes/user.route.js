import { Router } from "express";
import { body } from "express-validator"; // Importing 'body' for validation
import { createUserController , getAllUsersController, loginController, logoutController, profileController } from "../controllers/user.controller.js"; // Import the named export
import { authUser } from "../middleware/auth.middleware.js";
import { getAllUsers } from "../services/user.service.js";
const router = Router();

router.post(
    "/register",
    [
        body("email").isEmail().withMessage("Email must be a valid email address"),
        body("password").isLength({ min: 3 }).withMessage("Password must be at least 3 characters long")
    ],
    createUserController // Use the named export directly
);
router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Email must be a valid email address"),
        body("password").isLength({ min: 3 }).withMessage("Password must be at least 3 characters long")
    ],
   loginController // Use the named export directly
);

router.get('/profile', authUser, (req, res) => {
    console.log('Profile route hit');
    profileController(req, res);
});


router.get('/logout', authUser, logoutController)

router.get('/all', authUser , getAllUsersController)

export default router;
