import express from 'express'
import { listItems, getItem, createItem, updateItem, deleteItem } from '../controllers/customItemsController.js'

const router = express.Router()

router.get('/items', listItems)
router.get('/items/:id', getItem)
router.post('/items', createItem)
router.put('/items/:id', updateItem)
router.delete('/items/:id', deleteItem)

export default router
