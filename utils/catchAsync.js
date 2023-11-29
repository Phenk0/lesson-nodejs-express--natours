exports.catchAsync = (fnToCatchError) => (req, res, next) =>
  fnToCatchError(req, res, next).catch((err) => next(err));
