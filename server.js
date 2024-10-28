const path = require('path');
process.chdir(path.join(__dirname));

const express = require('express');
const authMiddleware = require('./authMiddleware');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const listsRoutes = require('./routes/listsRoutes');
require('dotenv').config();

const app = express();

// Middleware
app.use(bodyParser.json());

// Enable CORS for all routes and origins
app.use(cors());

// Routes
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/lists', authMiddleware, listsRoutes);

// For Vercel deployment
app.get('/', (req, res) => res.send('Express on Vercel'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
