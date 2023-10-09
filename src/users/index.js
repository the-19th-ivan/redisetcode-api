const router = require('express').Router();

const usersController = require('./users.controller');
const { userValidation } = require('./users.middleware');
const validator = require('../utils/validator.util');

router
  .route('/')
  .get(usersController.getAll)
  .post(userValidation, validator, usersController.create);

router
  .route('/:id')
  .get(usersController.getOne)
  .patch(usersController.update)
  .delete(usersController.delete);

module.exports = router;
