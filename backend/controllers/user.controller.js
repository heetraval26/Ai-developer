import userModel from '../models/user.model.js';
import userService from '../services/user.service.js'; 
import { validationResult } from 'express-validator';

import redisClient from '../services/redis.service.js';
export const createUserController = async (req , res ) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({erros: erros.array()});
    }
    try{
        const user = await userService.createUser(req.body);

        const token = await user.generateJWT(); 
        delete user._doc.password;
        res.status(201).json({ user, token});
    } catch(error){
        res.status(400).send(error.message);
    }
    

}

export const loginController = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const { email, password } = req.body;

        const user = await userModel.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                errors: 'Invalid credentials'
            })
        }

        const isMatch = await user.isValidPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                errors: 'Invalid credentials'
            })
        }

        const token = await user.generateJWT();
        delete user._doc.password;

        

        res.status(200).json({ user, token });


    } catch (err) {

        console.log(err);

        res.status(400).send(err.message);
    }
}

export const profileController = async (req, res) => {
    console.log("Profile route accessed, user:", req.user);
    res.status(200).json({
        user: req.user
    });

}



export const logoutController = async (req, res) => {
    try {
        // Ensure req.headers.authorization exists before splitting
        const token = req.cookies?.token || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);

        if (!token) {
            return res.status(400).json({ message: "No token provided" });
        }

        // Store the token in Redis for logout tracking (expires in 24 hours)
        await redisClient.set(token, 'logout', 'EX', 60 * 60 * 24);

        // Clear the cookie if it's being used
        res.clearCookie("token");

        return res.status(200).json({ message: "Logged out successfully" });

    } catch (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed", error: err.message });
    }
};

export const getAllUsersController = async (req, res) => {
    try {

        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })

        const allUsers = await userService.getAllUsers({ userId: loggedInUser._id });

        return res.status(200).json({
            users: allUsers
        })

    } catch (err) {

        console.log(err)

        res.status(400).json({ error: err.message })

    }
}








export default { createUserController, loginController, profileController, logoutController, getAllUsersController  };
