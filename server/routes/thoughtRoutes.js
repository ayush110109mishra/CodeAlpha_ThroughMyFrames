import express from 'express';
import { body } from 'express-validator';
import {
  getThoughts,
  getThoughtById,
  getRandomThought,
  createThought,
  updateThought,
  deleteThought,
} from '../controllers/thoughtController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const createThoughtValidation = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Thought text cannot be empty')
    .isLength({ max: 500 })
    .withMessage('Thought cannot exceed 500 characters'),
];

router.get('/random', getRandomThought);

router
  .route('/')
  .get(getThoughts)
  .post(protect, validate(createThoughtValidation), createThought);

router
  .route('/:id')
  .get(getThoughtById)
  .put(protect, updateThought)
  .delete(protect, deleteThought);

export default router;
