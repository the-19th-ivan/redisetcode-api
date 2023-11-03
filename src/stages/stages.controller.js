const Stage = require('./stage');
const User = require('../users/user');
const Badge = require('../badges/badge');

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

  // Find the highest completed stage number
  const highestCompletedStageNumber = Math.max(
    ...user.completedStages.map((completedStage) => completedStage.stageNumber),
  );

  const categorizedStages = stages.map((stage) => {
    const isCompleted = user.completedStages.some((completedStage) =>
      completedStage._id.equals(stage._id),
    );

    if (isCompleted) {
      return { stage, status: 'completed' };
    }

    if (
      stage.stageNumber === 1 ||
      stage.stageNumber <= highestCompletedStageNumber + 1
    ) {
      return { stage, status: 'available' };
    }

    return { stage, status: 'locked' };
  });

  // Sort the categorized stages by status: "available" > "locked" > "completed"
  categorizedStages.sort((a, b) => {
    const statusOrder = { available: 0, locked: 1, completed: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  // Send the categorized stages as a JSON response
  res.status(200).json({
    status: 'success',
    data: {
      stages: categorizedStages,
    },
  });
});

exports.markAsDone = catchAsync(async (req, res, next) => {
  const { stageId } = req.params;
  const { bonus } = req.body;
  let levelUp = false;
  let badgeEarned = false;

  const stage = await Stage.findById(stageId);

  if (!stage) return next(new AppError('No stage with that ID found', 404));

  const user = await User.findById(req.user._id);

  const currentLevel = user.level;

  if (user.completedStages.includes(stage._id))
    return next(new AppError('This stage is already completed', 400));

  user.completedStages.push(stage._id);
  user.experience += bonus ? stage.exp * 2 : stage.exp;

  let badge;
  // Check if the completed stage has a stageNumber of 1 and assign a badge
  if (stage.stageNumber === 1) {
    badge = await Badge.findById('65335d932eee7695841b9af3');
    badgeEarned = true;
    user.badges.push(badge);
  }
  if (stage.stageNumber === 7) {
    badge = await Badge.findById('65447eda49567baead204c01');
    badgeEarned = true;
    user.badges.push(badge);
  }
  if (stage.stageNumber === 9) {
    badge = await Badge.findById('65447ffa49567baead204c0d');
    badgeEarned = true;
    user.badges.push(badge);
  }
  if (stage.stageNumber === 14) {
    badge = await Badge.findById('654480db49567baead204c1d');
    badgeEarned = true;
    user.badges.push(badge);
  }
  if (stage.stageNumber === 15) {
    badge = await Badge.findById('65335e122eee7695841b9af7');
    badgeEarned = true;
    user.badges.push(badge);
  }

  await user.save();

  if (user.level !== currentLevel) levelUp = true;

  const nextStage = await Stage.findOne({ stageNumber: stage.stageNumber + 1 });

  res.status(200).json({
    status: 'success',
    data: {
      nextStage: nextStage ? nextStage._id : '',
      levelUp: {
        flag: levelUp,
        level: user.level,
      },
      earnBadge: {
        flag: badgeEarned,
        badge,
      },
    },
  });
});
