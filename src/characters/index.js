const router = require('express').Router();

const characterController = require('./characters.controller');
const { characterValidation } = require('./characters.middleware');
const validator = require('../utils/validator.util');
const { isAuth, restrictTo } = require('../auth/auth.middleware');

router
  .route('/')
  .get(characterController.getAll)
  .post(
    isAuth,
    restrictTo('admin'),
    characterValidation,
    validator,
    characterController.create,
  );

router
  .route('/:id')
  .get(characterController.getOne)
  .patch(isAuth, restrictTo('admin'), characterController.update)
  .delete(isAuth, restrictTo('admin'), characterController.delete);

module.exports = router;
