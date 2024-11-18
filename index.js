const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app.js");
const cloudinary = require('cloudinary').v2;


dotenv.config();

const { PORT, MONGODB_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});


const startServer = async () => {
    try {
        mongoose.set('strictQuery', true);

        await mongoose.connect(MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log("Connected to DB");

        app.listen(PORT, () => {
            console.log(`Running up the hill at ${PORT}km/hr`);
        });
    } catch (error) {
        console.log(error);
    }
};

startServer();
