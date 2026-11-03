import express from 'express';
import { body } from 'express-validator';
import { getPhotographer, submitContact } from '../controllers/photographerController.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const contactValidation = [
  body('email').isEmail().withMessage('A valid email address is required'),
  body('message').notEmpty().withMessage('Message cannot be empty'),
];

router.get('/', getPhotographer);
router.post('/contact', validate(contactValidation), submitContact);

export default router;

