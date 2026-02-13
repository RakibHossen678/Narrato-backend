// transaction.models.js (final)
const mongoose = require("mongoose");
const customIdGenerator = require("../../utils/customIdGenerator");

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

// Auto-generate transactionId before saving
transactionSchema.plugin(customIdGenerator, {
  field: "transactionId",
  prefix: "TRX",
  enableCondition: (transaction) =>
    !!transaction.amount && !!transaction.userId && !!transaction.blogId,
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
