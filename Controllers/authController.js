const Bank = require("../Models/bank_model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const jwtSign = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await Bank.create({
    name: req.body.name,
    phone: req.body.phone,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    // email: req.body.email,
    // dateOfBirth: req.body.dateOfBirth,
    // passwordChangedAt: req.body.passwordChangedAt,
  });

  const token = jwtSign(newUser._id);

  res.status(201).json({
    status: "success",
    token,
    data: {
      newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return next(new AppError("Please enter the phone and password", 401));
  }
  const user = await Bank.findOne({ phone }).select("+password");
  if (!user || !(await user.checkCorrectPassword(password)))
    return next(new AppError("the phone or the password is invalid", 401));

  const token = jwtSign(user._id);
  res.status(201).json({
    status: "success",
    token,
  });
});

exports.protectTour = catchAsync(async (req, res, next) => {
  let token;
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    return next(
      new AppError("You are not logged in please login to get access", 401)
    );
  } else {
    token = req.headers.authorization.split(" ")[1];
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const user = await Bank.findById(decoded.id);
  if (!user) {
    return next(
      new AppError(
        "The User belongs to that key isn't exists. Please login again",
        401
      )
    );
  }
  if (user.checkPasswordAfter(decoded.iat) === true) {
    return next(
      new AppError("The password changed after the token has been issued", 401)
    );
  }
  req.user = user;
  next();
});
