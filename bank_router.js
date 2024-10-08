const express = require("express");
const bankRouter = express.Router();
const bankController = require("./Controllers/bank_controller");
const authController = require("./Controllers/authController");
bankRouter.get(
  "/getAllUsers",
  authController.protectTour,
  authController.restrictTo("admin"),
  bankController.getAllUsers
);
bankRouter.get("/getUser", authController.protectTour, bankController.getUser);
bankRouter.post("/signup", authController.signup);
bankRouter.post("/login", authController.login);

bankRouter.get(
  "/showTransactions",
  authController.protectTour,
  bankController.showTransactions
);
bankRouter.patch(
  "/withdraw",
  authController.protectTour,
  bankController.withdrawMoney
);

bankRouter.patch(
  "/deposit",
  authController.protectTour,
  bankController.depositMoney
);
bankRouter.patch(
  "/sendMoney",
  authController.protectTour,
  bankController.sendMoney
);

module.exports = bankRouter;
