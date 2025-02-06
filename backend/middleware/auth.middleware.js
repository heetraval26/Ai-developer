import jwt from 'jsonwebtoken';
import redisClient from "../services/redis.service.js";

export const authUser = async (req, res, next) => {
    console.log('Authorization middleware is running...');

    // Log the Authorization Header for debugging
    console.log('Authorization Header:', req.headers.authorization);

    try {
        // Get token from the Authorization header
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).send({ error: 'Unauthorized User: No token provided' });
        }
        const isBlackListed = await redisClient.get(token); 
        
        if(isBlackListed){
            res.cookie('token','');
            return res.status(401).send({ error: 'Unauthorized error'})
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.log('Error:', error);
        res.status(401).send({ error: 'Unauthorized User' });
    }
};
