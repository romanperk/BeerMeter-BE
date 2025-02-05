const express = require('express');
const pool = require('../database');
const toCamelCase = require('../helpers/toCamelCase');
const router = express.Router();

// Create an item
router.post('/createItem', async (req, res) => {
  const { listId, name, type, size, amount, price } = req.body;

  try {
    const newPlace = await pool.query(
      'INSERT INTO items (list_id, name, type, size, amount, price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [listId, name, type, size, amount, price]
    );

    res.status(201).json({
      message: 'New item created',
      item: toCamelCase(newPlace.rows[0]),
    });
  } catch (error) {
    console.error('Error checking or creating item:', error);
    res.status(500).json({ message: 'Error processing item' });
  }
});

// !
// CHANGE THE ROUTES BELOW THIS!!!
// !

// Get all items for one list
router.get('/getItems/:listId', async (req, res) => {
  try {
    const { listId } = req.params;
    const result = await pool.query('SELECT * FROM items WHERE list_id = $1', [listId]);

    res.status(200).json(toCamelCase(result.rows));
  } catch (error) {
    console.error('Error fetching items', error);
    res.status(500).json({ message: 'Error fetching items' });
  }
});

// Increase amount of item
router.put('/increase/:itemId', async (req, res) => {
  const { itemId } = req.params;

  try {
    if (!itemId) {
      return res.status(400).json({ message: 'Item ID is required' });
    }

    // Update the item's amount by incrementing it by 1
    const updateResult = await pool.query(
      'UPDATE items SET amount = amount + 1 WHERE item_id = $1 RETURNING *',
      [itemId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Item not found or you are not authorized to modify this item',
      });
    }

    // Return the updated item
    res.status(200).json(toCamelCase(updateResult.rows[0]));
  } catch (error) {
    console.error('Error updating item amount:', error);
    res.status(500).json({ message: 'Error updating item amount' });
  }
});

// Decrease amount of item
router.put('/decrease/:itemId', async (req, res) => {
  const { itemId } = req.params;

  try {
    if (!itemId) {
      return res.status(400).json({ message: 'Item ID is required' });
    }

    // Update the item's amount by incrementing it by 1
    const updateResult = await pool.query(
      'UPDATE items SET amount = amount - 1 WHERE item_id = $1 RETURNING *',
      [itemId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Item not found or you are not authorized to modify this item',
      });
    }

    // Return the updated item
    res.status(200).json(toCamelCase(updateResult.rows[0]));
  } catch (error) {
    console.error('Error updating item amount:', error);
    res.status(500).json({ message: 'Error updating item amount' });
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

// Delete item by id
router.delete('/deleteItem/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM items WHERE item_id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json({ message: 'Item deleted successfully', item: result.rows[0] });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get item by id
router.get('/getItem/:itemId', async (req, res) => {
  const { itemId } = req.params;

  try {
    const result = await pool.query('SELECT * FROM items WHERE item_id = $1', [itemId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json(toCamelCase(result.rows[0]));
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Edit item
router.put('/updateItem/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, size, amount, price } = req.body;

  try {
    const fields = [];
    const values = [];
    let queryIndex = 1;

    if (name !== undefined) {
      fields.push(`name = $${queryIndex}`);
      values.push(name);
      queryIndex++;
    }
    if (type !== undefined) {
      fields.push(`type = $${queryIndex}`);
      values.push(type);
      queryIndex++;
    }
    if (size !== undefined) {
      fields.push(`size = $${queryIndex}`);
      values.push(size);
      queryIndex++;
    }
    if (amount !== undefined) {
      fields.push(`amount = $${queryIndex}`);
      values.push(amount);
      queryIndex++;
    }
    if (price !== undefined) {
      fields.push(`price = $${queryIndex}`);
      values.push(price);
      queryIndex++;
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }

    const query = `UPDATE items SET ${fields.join(', ')} WHERE item_id = $${queryIndex} RETURNING *`;
    values.push(id);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json(toCamelCase(result.rows[0]));
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;
