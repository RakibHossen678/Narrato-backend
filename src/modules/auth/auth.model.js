const mongoose = require("mongoose");
const customIdGenerator = require("../../utils/customIdGenerator");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    userId: { type: String, unique: true },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: null },
    googleId: { type: String, default: null },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true },
);

// Auto-generate userId before saving
UserSchema.plugin(customIdGenerator, {
  field: "userId",
  prefix: "USR",
  enableCondition: (user) => !!user.email,
});

// 🔐 Pre-save hook to hash password automatically
UserSchema.pre("save", async function (next) {
  // only hash if password was modified or is new
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ✅ Method to compare passwords (for login)
UserSchema.methods.isPasswordMatch = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
