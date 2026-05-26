// Centralized error handler — never leaks internals in production.
module.exports = (err, req, res, next) => {
  console.error("[ERROR]", err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.publicMessage || err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
