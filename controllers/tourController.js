const Tour = require('../models/tourModel');
const { processQuery } = require('../utils/apiFeatures');
const { createAppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');

//MIDDLEWARE FUNC
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  next();
};

//FEATURES
exports.getAllTours = catchAsync(async (req, res, next) => {
  //CLASS VARIATION
  // const features = new APIFeatures(Tour, req.query)
  //   .filter()
  //   .sort()
  //   .limitFields()
  //   .paginate();
  // const tours = await features.query;
  //
  // const query = Tour.find()
  //   .where('duration')
  //   .equals(5)
  //   .where('difficulty')
  //   .equals('easy');

  //EXECUTE QUERY
  const tours = await processQuery(
    Tour,
    req.query,
    '-ratingsAverage -ratingsQuantity'
  );

  //SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours }
  });
});
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  // Tour.findOne({ _id: req.params.id });

  if (!tour) return next(createAppError('No such tour found to show', 404));

  res.status(200).json({ status: 'success', data: { tour } });
});
exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { tour: newTour }
  });
});
exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!tour) return next(createAppError('No such tour found to update', 404));

  res.status(200).json({ status: 'success', data: { tour } });
});
exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) return next(createAppError('No such tour found to delete', 404));

  res.status(204).json({
    status: 'success',
    data: null
  });
});
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        // _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: {
        avgRating: -1
      }
    }
    // { $match: { _id: { $ne: 'EASY' } } }
  ]);

  res.status(200).json({ status: 'success', data: { stats } });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const { year } = req.params;

  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numToursStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    { $addFields: { month: '$_id' } },
    { $project: { _id: 0 } },
    {
      $sort: {
        month: 1
      }
    },
    { $limit: 12 }
  ]);
  res
    .status(200)
    .json({ status: 'success', data: { plan }, results: plan.length });
});
