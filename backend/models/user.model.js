import mongoose from "mongoose"; 
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    email: {
        type: "String",
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: [6, 'email must be at least 6 characters long'],
        maxLength: [50, 'email must not be longer than 50 characters']
    },

    password: {
        type: String,
        select: false,
    }
});

// Static method to hash password
userSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10);
}

// Instance method to compare passwords
userSchema.methods.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

// Instance method to generate JWT
userSchema.methods.generateJWT = function () {
    return jwt.sign({ email: this.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
}

const User = mongoose.model('User', userSchema);

export default User;
