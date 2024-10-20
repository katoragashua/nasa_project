const getPagination = (query) => {
  const limit = Math.abs(query.limit) || 0; //From MongoDB a limit of 0 means no limit, i.e. return all the documents
  const page = Math.abs(query.page) || 1;
  const skip = (page - 1) * limit;
  return { limit, skip };
};

module.exports = { getPagination };
