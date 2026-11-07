import express from 'express';
import { body } from 'express-validator';
import { getPhotographer, submitContact } from '../controllers/photographerController.js';
import { validate } from '../middleware/validate.js';
import { contactLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

const contactValidation = [
  body('email')
    .isString()
    .trim()
    .isEmail()
    .withMessage('A valid email address is required'),
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('type')
    .optional()
    .isString()
    .isIn([
      'Print Inquiry',
      'Editorial / Assignment',
      'Collaboration',
      'Personal Note',
      'General Inquiry',
    ])
    .withMessage('Invalid inquiry type'),
  body('message')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Message content cannot be empty')
    .isLength({ max: 2000 })
    .withMessage('Message cannot exceed 2000 characters'),
];

router.get('/', getPhotographer);
router.post('/contact', contactLimiter, validate(contactValidation), submitContact);

export default router;
