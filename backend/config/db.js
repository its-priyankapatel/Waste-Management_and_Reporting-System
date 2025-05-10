const mongoose = require("mongoose");
const colors = require("colors");
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log("Database connected".blue.bgGreen);
  } catch (error) {
    console.log("Error in Database connection".bgRed.white);
    console.log(error);
    process.exit(1);
  }
};
module.exports = connectDB;
