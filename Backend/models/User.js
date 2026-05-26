const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const sessionSchema = new mongoose.Schema(
  {
    refreshTokenHash: { type: String, required: true },
    userAgent: String,
    ip: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, select: false, minlength: 8 },

    role: { type: String, enum: ["user", "admin"], default: "user" },
    avatarUrl: String,
    jobTitle: String,
    location: String,
    phone: String,

    // OAuth
    providers: [
      {
        provider: { type: String, enum: ["google", "github"] },
        providerId: String,
      },
    ],

    // Verification
    emailVerified: { type: Boolean, default: false },
    emailVerificationTokenHash: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },

    // Password reset
    resetPasswordTokenHash: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    passwordChangedAt: Date,

    // Sessions (refresh-token rotation)
    sessions: { type: [sessionSchema], select: false, default: [] },

    // Audit
    lastLoginAt: Date,
    loginHistory: [
      {
        at: { type: Date, default: Date.now },
        ip: String,
        userAgent: String,
        success: Boolean,
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
    if (!this.isNew) this.passwordChangedAt = new Date();
  }
  next();
});

userSchema.methods.comparePassword = function (plain) {
  if (!this.password) return false;
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.createEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.emailVerificationTokenHash = crypto.createHash("sha256").update(token).digest("hex");
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  return token;
};

userSchema.methods.createPasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.resetPasswordTokenHash = crypto.createHash("sha256").update(token).digest("hex");
  this.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  return token;
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.sessions;
  delete obj.resetPasswordTokenHash;
  delete obj.resetPasswordExpires;
  delete obj.emailVerificationTokenHash;
  delete obj.emailVerificationExpires;
  obj.id = obj._id;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
