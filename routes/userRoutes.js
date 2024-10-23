const express = require('express');
const pool = require('../database');
const toCamelCase = require('../helpers/toCamelCase');
const router = express.Router();

// Create or check if a user already exists
router.post('/createUser', async (req, res) => {
  const { email, uid } = req.body;

  try {
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (existingUser.rows.length > 0) {
      return res.status(200).json({
        message: 'User already exists',
        user: toCamelCase(existingUser.rows[0]),
        isNewUser: false,
      });
    }

    const newUser = await pool.query('INSERT INTO users (email, uid) VALUES ($1, $2) RETURNING *', [
      email,
      uid,
    ]);

    res.status(201).json({
      message: 'New user created',
      user: toCamelCase(newUser.rows[0]),
      isNewUser: true,
    });
  } catch (error) {
    console.error('Error checking or creating user:', error);
    res.status(500).json({ message: 'Error processing user' });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No users in database' });
    }

    res.status(200).json(toCamelCase(result.rows));
  } catch (error) {
    console.error('Error fetching users', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get a user by id
router.get('/getUser/:uid', async (req, res) => {
  const { uid } = req.params;

  try {
    const result = await pool.query('SELECT * FROM users WHERE uid = $1', [uid]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(toCamelCase(result.rows[0]));
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Get a user by email
router.get('/getUser/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(toCamelCase(result.rows[0]));
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Update a user's email
router.put('/updateUserEmail/:email', async (req, res) => {
  const { email } = req.params;
  const { newEmail } = req.body;

  try {
    const result = await pool.query('UPDATE users SET email = $1 WHERE email = $2 RETURNING *', [
      newEmail,
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(toCamelCase(result.rows[0]));
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Update users info
router.put('/updateUserInfo/:uid', async (req, res) => {
  const { uid } = req.params;
  const { firstName, lastName, favDrink } = req.body;

  try {
    const result = await pool.query(
      'UPDATE users SET first_name = $1, last_name = $2, fav_drink = $3 WHERE uid = $4 RETURNING *',
      [firstName, lastName, favDrink, uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(toCamelCase(result.rows[0]));
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Delete user by email
router.delete('/deleteUser/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const result = await pool.query('DELETE FROM users WHERE email = $1 RETURNING *', [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete all users
router.delete('/deleteUsers', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM users');

    // Check the number of deleted rows
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'No users found to delete' });
    }

    res.status(200).json({ message: `${result.rowCount} users deleted successfully` });
  } catch (error) {
    console.error('Error deleting users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
