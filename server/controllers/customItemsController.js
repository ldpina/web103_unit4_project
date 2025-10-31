import { pool } from '../config/database.js'

const fetchOptionsByIds = async (ids) => {
  if (!ids?.length) return []
  const { rows } = await pool.query(
    'SELECT id, price_delta, icon_url FROM options WHERE id = ANY($1::int[])',
    [ids]
  )
  return rows
}

const violatesInvalidPairs = async (ids) => {
  if (!ids?.length) return false
  const { rows } = await pool.query(
    `SELECT 1 FROM invalid_option_pairs
     WHERE option_a = ANY($1::int[]) AND option_b = ANY($1::int[])
     LIMIT 1`,
    [ids]
  )
  return rows.length > 0
}

const calcTotal = (base, options) =>
  Number(base) + options.reduce((sum, o) => sum + Number(o.price_delta || 0), 0)

// Display items
export const listItems = async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM custom_items ORDER BY created_at DESC')
    res.json(rows)
  } catch {
    res.status(500).json({ error: 'Failed to fetch items' })
  }
}

//get item
export const getItem = async (req, res) => {
  try {
    const { id } = req.params
    const { rows } = await pool.query('SELECT * FROM custom_items WHERE id = $1', [id])
    if (!rows[0]) return res.status(404).json({ error: 'Not found' })
    res.json(rows[0])
  } catch {
    res.status(500).json({ error: 'Failed to fetch item' })
  }
}

//create a new item
export const createItem = async (req, res) => {
  try {
    const { title, base_price = 0, selected_option_ids = [], preview_url = '' } = req.body

    if (await violatesInvalidPairs(selected_option_ids)) {
      return res.status(400).json({ error: 'That combination is not allowed.' })
    }

    const options = await fetchOptionsByIds(selected_option_ids)
    const total = calcTotal(base_price, options)

    const { rows } = await pool.query(
      `INSERT INTO custom_items (title, base_price, selected_option_ids, total_price, preview_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, base_price, selected_option_ids, total, preview_url]
    )

    res.status(201).json(rows[0])
  } catch {
    res.status(500).json({ error: 'Failed to create item' })
  }
}

//update an item
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params
    const { title, base_price, selected_option_ids, preview_url } = req.body

    if (await violatesInvalidPairs(selected_option_ids)) {
      return res.status(400).json({ error: 'That combination is not allowed.' })
    }

    const options = await fetchOptionsByIds(selected_option_ids || [])
    const total = calcTotal(base_price || 0, options)

    const { rows } = await pool.query(
      `UPDATE custom_items
       SET title = $1,
           base_price = $2,
           selected_option_ids = $3,
           total_price = $4,
           preview_url = $5,
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [title, base_price, selected_option_ids, total, preview_url || '', id]
    )

    if (!rows[0]) return res.status(404).json({ error: 'Not found' })
    res.json(rows[0])
  } catch {
    res.status(500).json({ error: 'Failed to update item' })
  }
}

//delete item
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params
    const { rowCount } = await pool.query('DELETE FROM custom_items WHERE id = $1', [id])
    if (!rowCount) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to delete item' })
  }
}
