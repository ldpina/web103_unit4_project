import express from 'express'
import { getFeatures, getOptions, getInvalidPairs } from '../controllers/catalogController.js'

const router = express.Router()

router.get('/features', getFeatures)
router.get('/options', getOptions)
router.get('/invalid-pairs', getInvalidPairs)

export default router
