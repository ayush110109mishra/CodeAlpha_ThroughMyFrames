import express from 'express';
import { getMomentOfToday, getRandomMoment } from '../controllers/momentController.js';

const router = express.Router();

// GET /api/moment/today
router.get('/today', getMomentOfToday);

// GET /api/moment/random
router.get('/random', getRandomMoment);

export default router;
