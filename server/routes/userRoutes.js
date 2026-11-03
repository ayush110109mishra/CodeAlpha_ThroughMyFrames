import express from 'express';
import { getUserByUsername, toggleFollow } from '../controllers/userController.js';

const router = express.Router();

router.get('/:username', getUserByUsername);
router.post('/:username/follow', toggleFollow);

export default router;
