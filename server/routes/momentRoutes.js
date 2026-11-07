import express from 'express';
import { getMomentOfToday } from '../controllers/momentController.js';

const router = express.Router();

// GET /api/moment/today
router.get('/today', getMomentOfToday);

export default router;
