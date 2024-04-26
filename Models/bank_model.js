const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const bankSchema = mongoose.Schema({
  role: {
    type: String,
    enum: {
      values: ["admin", "user"],
      message: "Unauthorized role",
    },
    default: "user",
  },
  name: {
    type: String,
    required: [true, "A client must have a name"],
    trim: true,
  },
  phone: {
    type: String,
    unique: true,
    required: [true, "please enter your phone"],
    maxlength: [11, "the phone number must not exceeds 11 numbers"],
    minlength: [11, "the phone number should be 11 numbers"],
    validate: [
      {
        validator: function isNumeric(str) {
          return str.split("").every((char) => !isNaN(char));
        },
        message: "Must contains numbers ONLY",
      },
      {
        validator: function (val) {
          return val.startsWith("01");
        },
        message: "the phone number must begins with 01",
      },
    ],
  },
  // email: {
  //   type: String,
  //   required: [true, "Please provide email"],
  //   unique: true,
  //   validate: { validator: validator.isEmail, message: "Enter a valid email" },
  // },
  balance: {
    type: Number,
    default: 0,
    min: [0, "the minimum allowed balance is 0"],
  },
  // dateOfBirth: {
  //   type: Date,
  //   select: false,
  //   required: [true, "A client must have a date of birth"],
  // },
  // age: { type: Number },
  password: {
    type: String,
    select: false,
    required: [true, "please enter your password"],
    minlength: [8, "Password should have atleast 8 characters"],
  },
  passwordConfirm: {
    type: String,
    required: [true, "please confirm your password"],
    validate: {
      validator: function (el) {
        this.password === el;
      },
      message: "The password doestn't match the password confirm",
    },
  },
  passwordChangedAt: {
    type: Date,
    default: undefined,
  },
});
// bankSchema.pre("save", function (next) {
//   if (!this.isNew) return next();
//   const today = new Date();
//   let age = today.getFullYear() - this.dateOfBirth.getFullYear();
//   const m = today.getMonth() - this.dateOfBirth.getMonth();
//   if (m < 0 || (m === 0 && today.getDate() < this.dateOfBirth.getDate())) {
//     age--;
//   }
//   this.age = age;
//   next();
// });
bankSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

bankSchema.methods.checkCorrectPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};
bankSchema.methods.checkPasswordAfter = function (JWTIssueTime) {
  if (this.passwordChangedAt) {
    const timeChangedPass = parseInt(this.passwordChangedAt.getTime() / 1000);
    return timeChangedPass > JWTIssueTime;
  }

  return false;
};

const Bank = mongoose.model("Bank", bankSchema);
module.exports = Bank;
