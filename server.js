require("dotenv").config();
const express = require("express");
const authRoutes = require("./src/routes/authRoutes");
const taskRoutes = require("./src/routes/taskRoutes");
const cors = require("cors");
const connectDB = require("./src/config/db");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
