const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "supervisor", "worker", "citizen"],
      default: "citizen",
    },
    contact: {
      type: String,
      required: function () {
        return this.role === "citizen";
      },
    },
    address: {
      type: String,
      required: function () {
        return this.role === "citizen";
      },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
