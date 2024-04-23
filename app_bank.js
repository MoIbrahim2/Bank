const express = require("express");
const morgan = require("morgan");
const bankRouter = require(`${__dirname}/bank_router`);
const globalErrorHandler = require("./Controllers/errorController");
const AppError = require("./utils/appError");

const app = express();

// MIDDLEWARES
app.use(express.json());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); // this code will take the time and convert it into nice format and save it to the proberty .requestTime
  next();
});
app.use("/api/v1/bank", bankRouter);
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find${req.originalUrl}`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
