const { catchAsync } = require('../utils/catchAsync');
const { createAppError } = require('../utils/appError');
const { processQuery } = require('../utils/apiFeatures');

exports.getAll = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    //to allow for nested GET reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

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
    const docs = await processQuery(
      Model.find(filter),
      req.query,
      '-ratingsAverage -ratingsQuantity'
    ).populate(populateOptions);

    //SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: { data: docs }
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;

    if (!doc) return next(createAppError('No such tour document to show', 404));

    res.status(200).json({ status: 'success', data: { data: doc } });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { data: doc }
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(createAppError('No such document found to update', 404));
    }

    res.status(200).json({ status: 'success', data: { data: doc } });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(createAppError('No such document found to delete', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  });
