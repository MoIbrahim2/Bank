const { default: balanced } = require("balanced-match");
const Bank = require("../Models/bank_model");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Transaction = require("../Models/transaction_model");

exports.getUser = catchAsync(async (req, res, next) => {
  console.log(req.user);
  const user = await Bank.findOne({ phone: req.user.phone });
  if (!user) {
    return next(new AppError(`couldn't find user with that user`, 400));
  }
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.withdrawMoney = catchAsync(async (req, res, next) => {
  const moneyWithdrawed = req.body.withdrawAmount * 1;
  if (!moneyWithdrawed) {
    return next(new AppError("Please enter the withdraw amount", 400));
  }

  if (moneyWithdrawed > req.user.balance) {
    return next(new AppError(`not enough balance`, 400));
  }

  // const updatedClient = await Bank.findByIdAndUpdate(
  //   req.user._id,
  //   { $inc: { balance: -moneyWithdrawed } },
  //   { new: true, runValidators: true }
  // );

  req.user.balance = req.user.balance - moneyWithdrawed;
  const updatedClient = await req.user.save({ validateBeforeSave: false });

  await Transaction.create({
    phone: req.user.phone,
    typeOfTransaction: "Withdraw",
    amount: moneyWithdrawed,
    time: Date.now(),
  });
  res.status(200).json({
    status: "success",
    message: `Successfully operation your remaining balance is : ${updatedClient.balance}`,
  });
});
exports.depositMoney = catchAsync(async (req, res, next) => {
  const moneyDeposited = req.body.depositAmount * 1;
  if (!moneyDeposited)
    return next(new AppError("The must enter amount to deposit ", 400));
  if (moneyDeposited <= 0)
    return next(new AppError("You must enter a number > 0", 400));

  req.user.balance = req.user.balance + moneyDeposited;
  const updatedClient = await req.user.save({ validateBeforeSave: false });

  await Transaction.create({
    phone: req.user.phone,
    typeOfTransaction: "Deposit",
    amount: moneyDeposited,
    time: Date.now(),
  });
  res.status(200).json({
    status: "success",
    data: {
      message: `Successfully operation your remaining balance is : ${updatedClient.balance}`,
    },
  });
});
exports.sendMoney = catchAsync(async (req, res, next) => {
  const receiverPhone = req.body.phone;
  const transferAmount = req.body.transferAmount * 1;

  if (!receiverPhone || !transferAmount)
    return next(new AppError("Enter the phone and the transefer amount", 400));
  if (req.user.phone === receiverPhone) {
    return next(
      new AppError("the sender and the receiver are the same user ", 400)
    );
  }
  if (transferAmount <= 0)
    return next(new AppError("You must enter a number > 0"), 400);
  if (transferAmount > req.user.balance) {
    return next(new AppError(`no enough balance for ${req.user.email}`), 400);
  }

  const receiver = await Bank.findOne({ phone: receiverPhone });

  if (!receiver) {
    return next(new AppError("Couldn't find user with that email"), 404);
  }
  const time = Date.now();
  receiver.balance = receiver.balance + transferAmount;
  await receiver.save({ validateBeforeSave: false });

  await Transaction.create({
    phone: receiver.phone,
    typeOfTransaction: "Receive",
    amount: transferAmount,
    time: time,
    senderPhone: req.user.phone,
  });

  // const sender = await Bank.findByIdAndUpdate(
  //   req.user._id,
  //   { $inc: { balance: -transferAmount } },
  //   { new: true, runValidators: true }
  // );
  req.user.balance = req.user.balance - transferAmount;
  await req.user.save({ validateBeforeSave: false });

  await Transaction.create({
    phone: req.user.phone,
    typeOfTransaction: "Send",
    amount: transferAmount,
    time: time,
    receiverPhone: receiver.phone,
  });

  res.status(200).json({
    status: "success",
    message: `Successfully operation your remaining balance is : ${req.user.balance}`,
  });
});
exports.showTransactions = catchAsync(async (req, res, next) => {
  const transactions = await Transaction.aggregate([
    {
      $match: { phone: req.user.phone },
    },
    { $sort: { time: -1 } },
    { $project: { phone: 0 } },
    { $project: { __v: 0 } },
  ]);
  res.status(200).json({
    status: "success",
    transactions,
  });
});
