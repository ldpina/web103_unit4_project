import { pool } from '../config/database.js'

export const getFeatures = async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM features ORDER BY id')
    res.json(rows)
  } catch {
    res.status(500).json({ error: 'Failed to fetch features' })
  }
}

export const getOptions = async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM options ORDER BY feature_id, id')
    res.json(rows)
  } catch {
    res.status(500).json({ error: 'Failed to fetch options' })
  }
}

export const getInvalidPairs = async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT option_a, option_b FROM invalid_option_pairs')
    res.json(rows)
  } catch {
    res.status(500).json({ error: 'Failed to fetch invalid pairs' })
  }
}
