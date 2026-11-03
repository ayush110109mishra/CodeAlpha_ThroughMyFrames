import express from 'express';
import { body } from 'express-validator';
import {
  getCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
} from '../controllers/collectionController.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const createCollectionValidation = [
  body('title').notEmpty().withMessage('Collection title is required'),
  body('cover').notEmpty().withMessage('Cover image is required'),
];

router
  .route('/')
  .get(getCollections)
  .post(validate(createCollectionValidation), createCollection);

router
  .route('/:id')
  .get(getCollectionById)
  .put(updateCollection)
  .delete(deleteCollection);

export default router;
