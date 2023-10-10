const Stage = require('./stage');

const AppError = require('../utils/appError.util');
const catchAsync = require('../utils/catchAsync.util');

exports.create = catchAsync(async (req, res, next) => {
  const stage = await Stage.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      stage,
    },
  });
});

exports.getAll = catchAsync(async (req, res, next) => {
  const stages = await Stage.find();

  res.status(200).json({
    status: 'success',
    results: stages.length,
    data: {
      stages,
    },
  });
});

exports.getOne = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const stage = await Stage.findById(id);

  if (!stage) return next(new AppError('No stage found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: {
      stage,
    },
  });
});

exports.update = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const stage = await Stage.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!stage) return next(new AppError('No stage found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: {
      stage,
    },
  });
});

exports.delete = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const stage = await Stage.findByIdAndDelete(id);

  if (!stage) return next(new AppError('No stage found with that ID', 404));

  res.status(204).json({});
});
