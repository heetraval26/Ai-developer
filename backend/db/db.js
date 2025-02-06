import mongoose from "mongoose";


function connect() {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        console.error("MONGO_URI is not defined in the environment variables.");
       // Exit the process if no URI
    }

    mongoose
        .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log("Connected to MongoDB"))
        .catch((err) => {
            console.error("Error connecting to MongoDB:", err);
        });
}

export default connect;
