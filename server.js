const path = require('path');
process.chdir(path.join(__dirname));

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();

const app = express();

// Middleware
app.use(bodyParser.json());

// Enable CORS for all routes and origins
app.use(cors({
  origin: '*', // Allow all origins
  methods: 'GET,POST,PUT,DELETE,OPTIONS', // Specify allowed HTTP methods
  credentials: true
}));

// Routes
app.use('/api/users', userRoutes);

// For Vercel deployment
app.get('/', (req, res) => res.send('Express on Vercel'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
