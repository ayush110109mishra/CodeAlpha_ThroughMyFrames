import express from 'express';
import { body } from 'express-validator';
import {
  getCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
  toggleFrameInCollection,
} from '../controllers/collectionController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const createCollectionValidation = [
  body('title').trim().notEmpty().withMessage('Collection title is required'),
  body('cover').trim().notEmpty().withMessage('Cover image URL is required'),
];

router
  .route('/')
  .get(getCollections)
  .post(protect, validate(createCollectionValidation), createCollection);

router
  .route('/:id')
  .get(getCollectionById)
  .put(protect, updateCollection)
  .delete(protect, deleteCollection);

router.post('/:id/frames', protect, toggleFrameInCollection);

export default router;
