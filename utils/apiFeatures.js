exports.processQuery = function (modelRaw, queryRaw, defaultSortBy = '') {
  //BUILD QUERY
  const queryObj = { ...queryRaw };

  // 1) Filtering & mutating -queryObj-
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((fieldToDelete) => delete queryObj[fieldToDelete]);

  // 2) Advanced filtering
  const queryEdited = JSON.parse(
    JSON.stringify(queryObj).replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    )
  );
  let query = modelRaw.find(queryEdited);

  //SORTING
  if (queryRaw.sort) {
    const sortBy = queryRaw.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else if (defaultSortBy) {
    query.sort(defaultSortBy);
  }

  //FIELD LIMITING
  if (queryRaw.fields) {
    const fields = queryRaw.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    //excluding unnecessary fields
    query = query.select('-__v');
  }

  //PAGINATION
  const page = Number(queryRaw.page) || 1;
  const limit = Number(queryRaw.limit) || 10;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);
  /*  if (req.query.page) {
    const numTours = await Tour.countDocuments();
    if (skip >= numTours) throw new Error('This page does not exist');
  }*/

  //RESULT
  return query;
};
// class APIFeatures {
//   constructor(query, queryString) {
//     this.query = query;
//     this.queryString = queryString;
//   }
//
//   filter() {
//     const queryObj = { ...this.queryString };
//
//     // 1) Filtering & mutating -queryObj-
//     const excludedFields = ['page', 'sort', 'limit', 'fields'];
//     excludedFields.forEach((fieldToDelete) => delete queryObj[fieldToDelete]);
//
//     // 2) Advanced filtering
//     const queryStructured = JSON.parse(
//       JSON.stringify(queryObj).replace(
//         /\b(gte|gt|lte|lt)\b/g,
//         (match) => `$${match}`
//       )
//     );
//     this.query = this.query.find(queryStructured);
//     return this;
//   }
//
//   sort() {
//     if (this.queryString.sort) {
//       const sortBy = this.queryString.sort.split(',').join(' ');
//       this.query = this.query.sort(sortBy);
//     } else {
//       this.query = this.query.sort('-ratingsAverage -ratingsQuantity');
//     }
//     return this;
//   }
//
//   limitFields() {
//     if (this.queryString.fields) {
//       const fields = this.queryString.fields.split(',').join(' ');
//       this.query = this.query.select(fields);
//     } else {
//       //excluding unnecessary fields
//       this.query = this.query.select('-__v');
//     }
//     return this;
//   }
//
//   paginate() {
//     const page = Number(this.queryString.page) || 1;
//     const limit = Number(this.queryString.limit) || 10;
//     const skip = (page - 1) * limit;
//
//     this.query = this.query.skip(skip).limit(limit);
//
//     return this;
//   }
// }
