const Stage = require('./stage');
const User = require('../users/user');

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

exports.getStagesByZone = catchAsync(async (req, res, next) => {
  const { zoneId } = req.params;

  const user = await User.findById(req.user._id).populate('completedStages');

  const stages = await Stage.find({ zone: zoneId });

  // Categorize stages as "locked," "available," or "completed"
  let available = false; // Indicates whether the next stage should be "available"
  const categorizedStages = stages.map((stage) => {
    const isCompleted = user.completedStages.some((completedStage) =>
      completedStage._id.equals(stage._id),
    );

    if (isCompleted) {
      available = true; // Set available to true after finding a completed stage
      return { stage, status: 'completed' };
    }

    if (available || stage.stageNumber === 1) {
      available = false;
      return { stage, status: 'available' };
    }

    return { stage, status: 'locked' };
  });

  // Send the categorized stages as a JSON response
  res.status(200).json({
    status: 'success',
    data: {
      stages: categorizedStages,
    },
  });
});
