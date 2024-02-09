const Tour = require('../models/tourModel');
const { catchAsync } = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  //1 Get tour data from collection
  const tours = await Tour.find();
  //2 Build template

  //3 Render that template using the data from step 1
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
    user: 'Roman'
  });
});
exports.getTour = catchAsync(async (req, res) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review rating user'
  });
  res.status(200).render('tour', {
    title: tour.name,
    tour
  });
});
