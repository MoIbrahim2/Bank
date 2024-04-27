const AppError = require("../utils/appError");

const handleDuplicateFieldsDb = (err) => {
  let message;
  if (err.keyValue.phone) {
    message = `The phone : '${err.keyValue.phone}' is already signed up`;
  }
  return new AppError(message, 400);
};
const handleValidationErrorDb = (err) => {
  const errors = Object.values(err.errors).map((val) => {
    val.message;
  });
  const message = `Invalid input error/errors.${errors.join(". ")}`;
  return new AppError(message, 400);
};
const handleTokenError = (err) => {
  const message = "Invalid token. Please login again!";
  return new AppError(message, 401);
};
const handleExpiredToken = (err) => {
  const message = "Expired Token";
  return new AppError(message, 401);
};
const sendErrorDevelopment = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    err,
    message: err.message,
    stack: err.stack,
  });
};
const sendErrorProduction = (err, res) => {
  if (err.isOperational === true) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    console.error("Error 💣 ", err);
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV == "development") {
    sendErrorDevelopment(err, res);
  } else if (process.env.NODE_ENV == "production") {
    let error = { ...err, name: err.name, message: err.message };
    if (error.name === "CastError") {
      error = handleCastErrorDb(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateFieldsDb(error);
    }
    if (error.name === "ValidationError") {
      error = handleValidationErrorDb(error);
    }
    if (error.name === "JsonWebTokenError") {
      error = handleTokenError(error);
    }
    if (error.name === "TokenExpiredError") {
      error = handleExpiredToken(error);
    }
    sendErrorProduction(error, res);
    next();
  }
};
