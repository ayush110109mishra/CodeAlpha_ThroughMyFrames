import { validationResult } from 'express-validator';

/**
 * ==============================================================================
 * Request Validation Middleware (express-validator helper)
 * ==============================================================================
 * WHY THIS FILE EXISTS:
 * In a professional REST API, input validation prevents corrupted data from entering
 * our database. Instead of cluttering controllers with repetitive `if (!body.field)`
 * logic, express-validator rules run before the controller.
 *
 * This middleware checks `validationResult(req)`:
 * - If errors exist, it halts execution immediately with a 400 Bad Request.
 * - If clean, it seamlessly passes control to `next()`.
 */

export const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations in parallel
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      success: false,
      message: 'Validation failed on submitted data',
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  };
};

