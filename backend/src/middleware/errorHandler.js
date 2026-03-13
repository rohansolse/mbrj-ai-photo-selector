function notFoundHandler(_req, res) {
  res.status(404).json({ message: "Route not found" });
}

function errorHandler(error, _req, res, _next) {
  console.error(error);

  const status = error.statusCode || 500;
  res.status(status).json({
    message: error.message || "Internal server error",
    details: error.details || null,
  });
}

module.exports = { errorHandler, notFoundHandler };
