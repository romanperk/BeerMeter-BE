const path = require("path");
process.chdir(path.join(__dirname));

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
require("dotenv").config();

const app = express();

// Middleware
app.use(bodyParser.json());

// Enable CORS for all routes and origins
app.use(cors());

// Routes
app.use("/api/users", userRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
