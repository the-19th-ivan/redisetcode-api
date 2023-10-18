const Quest = require('./quest');
const Result = require('../result/result');
const User = require('../users/user');

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

exports.getQuests = catchAsync(async (req, res, next) => {
  // Get the user ID of the currently logged-in user (you'll need to implement this)
  const userId = req.user._id;

  // Find all quests
  const quests = await Quest.find();

  // Find all results for the current user
  const userResults = await Result.find({ user: userId });

  // Create a map to keep track of which quests have been taken by the user
  const userTakenQuests = new Map();
  userResults.forEach((result) => {
    userTakenQuests.set(result.quest.toString(), true);
  });

  // Create a list of quests with availability status
  const questsWithStatus = quests.map((quest) => {
    const isTaken = userTakenQuests.get(quest._id.toString()) || false;
    return {
      quest,
      isAvailable: !isTaken,
    };
  });

  res.status(200).json({
    status: 'success',
    results: questsWithStatus.length,
    data: {
      quests: questsWithStatus,
    },
  });
});

exports.submitAnswer = catchAsync(async (req, res, next) => {
  const userId = req.user._id; // Extracted from the authenticated user
  const { questId } = req.params;
  const { userResponses } = req.body;

  const user = await User.findById(userId);

  // Find the quest by ID
  const quest = await Quest.findById(questId);

  if (!quest) {
    return res.status(404).json({ message: 'Quest not found' });
  }

  let totalScore = 0;

  // Iterate through userResponses and compare with quest's questions
  userResponses.forEach((userResponse) => {
    const matchingQuestion = quest.questions.find(
      (question) => question.questionText === userResponse.questionText,
    );

    if (matchingQuestion && matchingQuestion.answer === userResponse.answer) {
      totalScore += 1; // Increase score for correct answer
    }
  });

  const isPassed = totalScore >= quest.passingScore;

  if (isPassed) {
    user.experience += quest.exp;
  } else {
    user.experience += Math.floor(quest.exp / 2);
  }
  await user.save();

  const result = await Result.create({
    user: userId,
    quest: quest._id,
    score: totalScore,
    isPassed,
  });

  res.status(200).json({
    status: 'success',
    data: {
      result,
    },
  });
});
