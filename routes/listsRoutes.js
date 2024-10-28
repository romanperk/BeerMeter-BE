const express = require('express');
const pool = require('../database');
const toCamelCase = require('../helpers/toCamelCase');
const router = express.Router();

// Create or check if a user already exists
router.post('/createList', async (req, res) => {
  const { place, type, userId } = req.body;

  try {
    const newPlace = await pool.query(
      'INSERT INTO lists (place, type, creator_id) VALUES ($1, $2, $3) RETURNING *',
      [place, type, userId]
    );

    res.status(201).json({
      message: 'New list created',
      user: toCamelCase(newPlace.rows[0]),
    });
  } catch (error) {
    console.error('Error checking or creating list:', error);
    res.status(500).json({ message: 'Error processing list' });
  }
});

// Get all lists for user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query('SELECT * FROM lists WHERE creator_id = $1', [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No lists in database' });
    }

    res.status(200).json(toCamelCase(result.rows));
  } catch (error) {
    console.error('Error fetching lists', error);
    res.status(500).json({ message: 'Error fetching lists' });
  }
});

// Get a list by id
router.get('/getList/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  try {
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const result = await pool.query('SELECT * FROM lists WHERE list_id = $1 AND creator_id = $2', [
      id,
      userId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'List not found or you are not authorized to view this list',
      });
    }

    res.status(200).json(toCamelCase(result.rows[0]));
  } catch (error) {
    console.error('Error fetching list:', error);
    res.status(500).json({ message: 'Error fetching list' });
  }
});

// Update list info
router.put('/updateList/:id', async (req, res) => {
  const { id } = req.params;
  const { place, type } = req.body;

  try {
    const result = await pool.query('UPDATE lists SET place = $1, type = $2 WHERE list_id = $3 RETURNING *', [
      place,
      type,
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'List not found' });
    }

    res.status(200).json(toCamelCase(result.rows[0]));
  } catch (error) {
    console.error('Error updating list:', error);
    res.status(500).json({ message: 'Error updating list' });
  }
});

// Delete list by id
router.delete('/deleteList/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM lists WHERE list_id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'List not found' });
    }

    res.status(200).json({ message: 'List deleted successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
