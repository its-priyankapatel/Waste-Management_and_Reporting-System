const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const testRoutes = require("./Routes/testRoutes");
const authRoutes = require("./Routes/authRoutes");
const complaintRoutes = require("./Routes/complaintRoutes");
const verificationRoutes = require("./Routes/verificationRoutes");
const viewRoutes = require("./Routes/viewRoutes");
// create instance
const app = express();
dotenv.config();

//database connection
connectDB();

//middlewares
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//test API
app.use("/api/test/v1", testRoutes);
app.use("/api/users/v1", authRoutes);
app.use("/api/users/v1", authRoutes);
app.use("/api/complaints/v1", complaintRoutes);
app.use("/api/verify/v1", verificationRoutes);
app.use("/api/view/v1", viewRoutes);

const PORT = process.env.PORT || 4000;

//create server
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`.bgMagenta);
});
