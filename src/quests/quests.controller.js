const Quest = require('./quest');

const AppError = require('../utils/appError.util');
const catchAsync = require('../utils/catchAsync.util');

exports.create = catchAsync(async (req, res, next) => {
  const quest = await Quest.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      quest,
    },
  });
});

exports.getAll = catchAsync(async (req, res, next) => {
  const quests = await Quest.find().select('-questions');

  res.status(200).json({
    status: 'success',
    results: quests.length,
    data: {
      quests,
    },
  });
});

exports.getOne = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const quest = await Quest.findById(id);

  if (!quest) return next(new AppError('No quest found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: {
      quest,
    },
  });
});

exports.update = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const quest = await Quest.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!quest) return next(new AppError('No quest found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: {
      quest,
    },
  });
});

exports.delete = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const quest = await Quest.findByIdAndDelete(id);

  if (!quest) return next(new AppError('No quest found with that ID', 404));

  res.status(204).json({});
});
