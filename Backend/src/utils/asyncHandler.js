const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) => {
      if (typeof next === "function") {
        next(error);
      } else if (res && typeof res.status === "function") {
        res.status(500).json({
          success: false,
          message: error.message || "Internal Server Error",
        });
      } else {
        console.error("Unhandled async error:", error);
      }
    });
  };
};

export { asyncHandler };
