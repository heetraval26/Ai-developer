import userModel from '../models/user.model.js';

export const createUser = async ({ email, password }) => {
    if (!email || !password) {
        throw new Error('Email and password are required');
    }

    // Check if the user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
        throw new Error('User with this email already exists');
    }

    // Hash the password using the static method
    const hashedPassword = await userModel.hashPassword(password);

    // Create the new user
    const user = await userModel.create({
        email,
        password: hashedPassword,
    });

    // Return the created user (omit the password for security)
    return user.toObject({ getters: true, virtuals: false });
};

export const getAllUsers = async ({ userId }) => {
    if (!userId) {
        throw new Error('User ID is required');
    }

    // Find all users except the one with the provided userId
    const users = await userModel.find({ _id: { $ne: userId } }).select('-password');
    return users;
};

// Export the functions
export default { createUser, getAllUsers };