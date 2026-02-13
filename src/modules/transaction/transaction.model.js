// transaction.models.js (final)
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, unique: true, required: true },
    userId: { type: String, required: true, index: true },
    blogId: { type: String, required: true, index: true },

    amount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["stripe", "ssl_commerz"],
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Transaction", transactionSchema);
