const mongoose = require("mongoose");
const validator = require("validator");
const transactionSchema = mongoose.Schema({
  phone: String,
  typeOfTransaction: {
    type: String,
    emum: ["Withdraw", "Deposit", "Send", "Receive"],
  },
  amount: String,
  time: String,
  receiverPhone: { type: String, default: undefined },
  senderPhone: { type: String, default: undefined },
});
const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
